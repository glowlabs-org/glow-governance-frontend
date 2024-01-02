'use client'
import { Manrope } from 'next/font/google'
import { useState } from 'react'
import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { ChartOptions, Tick } from 'chart.js'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useContracts } from '@/hooks/useContracts'
import { BigNumber, ethers } from 'ethers'
import { PROXY_URL } from '@/constants/proxy-url'
import { useQueries } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import keccak256 from 'keccak256'

const inter = Manrope({ subsets: ['latin'] })
const TESTING: boolean = true
const SENTINEL_VALUES = [1, 2] //1=cancelled, 2=ignore
type ServerDataResponse = {
  device: string
  powerOutput: number
  impactRate: number
  credits: number
}

type AggregateChartData = {
  timestamp: number
  credits: number
}

function getTimestampFromWeekNumber(weekNumber: number, index: number) {
  const indexTimesFiveMinutes = index * 5 * 60 * 1000 // 5 minutes in milliseconds
  const SECONDS_IN_WEEK = 604800
  //Do current week number minus one, and then add the index times 5 minutes
  const timestamp =
    GENESIS_TIMESTAMP * 1000 +
    weekNumber * SECONDS_IN_WEEK * 1000 +
    indexTimesFiveMinutes
  return timestamp
}

import { getProtocolWeek } from '@/utils/getProtocolWeek'
import { GCAServerResponse } from '@/types/GCAServerResponse'
import { farmPubKeyToId } from '@/utils/farmPubKeyToId'

import { Line } from 'react-chartjs-2'

import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function OutputTable({ data }: { data: GCAServerResponse }) {
  return (
    <>
      <Table className="bg-white rounded-lg mt-8">
        <TableCaption>All farms on this week</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Farm ID</TableHead>
            <TableHead>Power Output</TableHead>
            <TableHead>Impact Points</TableHead>
            <TableHead className="text-right">Total Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.Devices.map((device) => {
            const pubKey = farmPubKeyToId(device.PublicKey)
            let totalImpactPoints = 0
            let totalPowerOutputs = 0
            let totalCredits = 0
            for (let i = 0; i < device.ImpactRates.length; ++i) {
              const impactPoints = device.ImpactRates[i]
              const powerOutput = device.PowerOutputs[i]
              if (SENTINEL_VALUES.includes(powerOutput)) continue
              totalImpactPoints += impactPoints
              totalPowerOutputs += powerOutput
              totalCredits += (impactPoints * powerOutput) / 10 ** 15
            }

            return (
              <>
                <TableRow>
                  <TableCell className="font-medium">{pubKey}</TableCell>
                  <TableCell>{totalPowerOutputs}</TableCell>
                  <TableCell>{totalImpactPoints}</TableCell>
                  <TableCell className="text-right">
                    {totalCredits.toFixed(4)}
                  </TableCell>
                </TableRow>
              </>
            )
          })}
          {/* <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell> */}
        </TableBody>
      </Table>
    </>
  )
}
export default function Output() {
  const [weekNumber, setWeekNumber] = useState(getProtocolWeek())
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: `Production For Week ${weekNumber}`,
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  })
  const [totalCredits, setTotalCredits] = useState<number | string>('Loading')

  const [statsForWeekQuery] = useQueries({
    queries: [
      {
        queryKey: ['statsForWeek', weekNumber],
        queryFn: () =>
          getCreditsForWeek(
            'http://95.217.194.59:35015/api/v1/all-device-stats',
            weekNumber
          ),
        refetchInterval: 1000 * 60 * 60,
        //@ts-ignore
        onSuccess: ({ aggregateChartData }) => {
          const labels: unknown[] = []
          for (let i = 0; i < aggregateChartData.length; i++) {
            const obj = new Date(
              aggregateChartData[i].timestamp
            ).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
            labels.push(obj)
          }
          const newChartData = {
            ...chartData,
            //@ts-ignore
            labels: labels,
            datasets: [
              //@ts-ignore
              {
                ...chartData.datasets[0],
                //@ts-ignore
                data: aggregateChartData.map((d) => d.credits),
              },
            ],
          }
          //@ts-ignore
          setChartData(newChartData)
        },
      },
    ],
  })

  async function getCreditsForWeek(
    url: string,
    weekNumber: number
  ): Promise<{
    aggregateChartData: AggregateChartData[]
    data: GCAServerResponse
  }> {
    //@ts-ignore
    if (!url) return undefined
    const weekTimes2016 = weekNumber * 2016
    // alert(weekTimes2016)
    const fullUrl = `${PROXY_URL}/${url}?timeslot_offset=${weekTimes2016}`
    const res = await fetch(fullUrl)
    const data = (await res.json()) as GCAServerResponse
    // console.log({ data })
    let sumOfAllCredits: number = 0
    const aggregateChartData: AggregateChartData[] = []

    for (let i = 0; i < data.Devices[0].ImpactRates.length; ++i) {
      const timestamp = getTimestampFromWeekNumber(weekNumber, i)
      let sumOfCredits = 0
      for (let j = 0; j < data.Devices.length; j++) {
        const device = data.Devices[j]
        if (SENTINEL_VALUES.includes(device.PowerOutputs[i])) continue
        const credits =
          (device.ImpactRates[i] * device.PowerOutputs[i]) / 10 ** 15
        sumOfCredits += credits
        sumOfAllCredits += credits
      }
      aggregateChartData.push({
        timestamp,
        credits: sumOfCredits,
      })
    }
    setTotalCredits(sumOfAllCredits.toFixed(4))
    return { aggregateChartData, data }
  }

  // React.useEffect(() => {
  //   const totalCredits = getTotalCredits()
  //   setTotalCredits(totalCredits)
  // }, [statsForWeekQuery.data])

  function getAllWeeksForSelect() {
    const weeks: number[] = []
    const currentWeek = getProtocolWeek()
    for (let i = 0; i <= currentWeek; ++i) {
      weeks.push(i)
    }
    return weeks
  }

  return (
    <div>
      <div className="container mx-auto mt-12">
        <h2>
          <span className="text-2xl font-bold">
            Carbon Credit Output For Week {weekNumber}:{' '}
            {statsForWeekQuery.isLoading ? 'Loading...' : totalCredits}
          </span>

          <Select
            onValueChange={(value) => {
              setWeekNumber(parseInt(value))
            }}
          >
            <SelectTrigger defaultValue={weekNumber} className="w-[180px]">
              <SelectValue placeholder={`Week ${weekNumber}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {
                  //@ts-ignore
                  getAllWeeksForSelect().map((week) => (
                    <SelectItem value={week.toString()}>Week {week}</SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </h2>

        <div className="flex justify-between items-center ">
          <div className="md:w-[900px] mx-auto">
            {statsForWeekQuery.isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin" size={64} />
              </div>
            ) : (
              <Line className="bg-white rounded-lg px-2" data={chartData} />
            )}
          </div>
        </div>
        {statsForWeekQuery.data?.data && (
          <div className="flex justify-center items-center">
            <OutputTable data={statsForWeekQuery.data?.data!} />
          </div>
        )}
      </div>
    </div>
  )
}
