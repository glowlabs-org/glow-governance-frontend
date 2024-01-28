import React, { useState } from 'react'
import { GenericTable } from '@/components/GenericTable/GenericTable'
import { useQueries } from '@tanstack/react-query'
import { getProtocolWeek } from '@/utils/getProtocolWeek'
import { getWeeklyReportsData } from '@/utils/getWeeklyReportsData'
import { sumOfArray } from '@/utils/sumOfArray'
import { formatNumber } from '@/utils/formatNumber'
import { slotToTimestamp } from '@/utils/slotToTimestamp'
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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Loader2 } from 'lucide-react'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
type ChartData = {
  timestamp: number
  cumSumPerSlot: number
}

async function getWeeklyReportTableData(url: string, week: number) {
  const rewards = 175_000
  const data = await getWeeklyReportsData(url, week, true)
  const sortedByCarbonCreditProduction = data.sort(
    (a, b) => b.carbonCreditsProduced - a.carbonCreditsProduced
  )
  const sumOfWeeklyPayments = sumOfArray(data.map((row) => row.weeklyPayment))
  const values = sortedByCarbonCreditProduction.map((row) => [
    row.hexlifiedPublicKey,
    formatNumber(row.powerOutput, 2),
    formatNumber(row.rollingImpactPoints, 0),
    formatNumber(row.carbonCreditsProduced, 4),
    formatNumber((row.weeklyPayment / sumOfWeeklyPayments) * rewards, 2),
  ])

  //Next, we need to find the cum-sum of credits produced per slot
  //Each farm has a powerOutputs[2016] array
  let chartData: ChartData[] = new Array(2016).fill(0)
  for (let i = 0; i < 2016; i++) {
    chartData[i] = {
      timestamp: slotToTimestamp(week, i),
      cumSumPerSlot: sumOfArray(
        data.map((row) => {
          return ((row.powerOutputs[i] * row.impactRates[i]) / 1e15) * 2016
        })
      ),
    }
  }

  const sumOfCreditsProduced = sumOfArray(
    data.map((d) => d.carbonCreditsProduced)
  )

  return { values, chartData, sumOfCreditsProduced }
}

function getAllWeeksForSelect() {
  const weeks: number[] = []
  const currentWeek = getProtocolWeek()
  for (let i = 0; i <= currentWeek; ++i) {
    weeks.push(i)
  }
  return weeks
}

const WeeklyReport = () => {
  const [selectedWeek, setSelectedWeek] = useState<number>(getProtocolWeek())

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Production',
        data: [] as any[],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  })
  const [weeklyReportsQuery] = useQueries({
    queries: [
      {
        queryFn: () =>
          getWeeklyReportTableData('http://95.217.194.59:35015', selectedWeek),
        queryKey: ['weeklyReports', selectedWeek],
        // @ts-ignore
        onSuccess: ({ chartData }: { chartData: ChartData[] }) => {
          const chartLabels = chartData.map((d) => {
            return new Date(d.timestamp * 1000).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
          })
          const dataPoints = chartData.map((d) => d.cumSumPerSlot)
          const newChartData = {
            labels: chartLabels,
            datasets: [
              {
                label: 'Production',
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
              },
            ],
          }
          setChartData(newChartData)
        },
      },
    ],
  })

  const labels = [
    'Farm',
    'Power Output (Kilowatt Hours)',
    'Impact Rates',
    'Carbon Offset',
    'Rewards',
  ]
  const tableCaption = `Weekly Report for Week ${selectedWeek}`

  return (
    <>
      <div className="container mx-auto mt-12">
        <h2>
          <span className="text-2xl font-bold">
            Carbon Credit Output For Week {selectedWeek}:{' '}
            {
              //@ts-ignore
              //   formatNumber(weeklyReportsQuery.data?.sumOfCreditsProduced) ||
              weeklyReportsQuery.data?.sumOfCreditsProduced
                ? formatNumber(weeklyReportsQuery.data?.sumOfCreditsProduced, 4)
                : 'Loading...'
            }
          </span>

          <Select
            onValueChange={(value) => {
              setSelectedWeek(parseInt(value))
            }}
          >
            <SelectTrigger defaultValue={selectedWeek} className="w-[180px]">
              <SelectValue placeholder={`Week ${selectedWeek}`} />
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
        {weeklyReportsQuery.data ? (
          <>
            <div className="md:w-[900px] mx-auto mb-12">
              <Line className="bg-white rounded-lg px-2" data={chartData} />
            </div>
            <GenericTable
              labels={labels}
              tableCaption={tableCaption}
              values={weeklyReportsQuery.data.values}
            />
          </>
        ) : (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" size={64} />
          </div>
        )}
      </div>
    </>
  )
}

export default WeeklyReport
