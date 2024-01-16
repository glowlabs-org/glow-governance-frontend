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
import { getSlotForCurrentWeek } from '@/utils/getSlotForCurrentWeek'
import { SENTINEL_VALUES } from '@/constants/sentinel-values'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const TESTING: boolean = true

/// @dev Used for ChartJS
type AggregateChartData = {
  timestamp: number
  credits: number
}

type CondensedFarmData = {
  rollingImpactPoints: number
  powerOutput: number
  carbonCreditsProduced: number
}

/// @dev Used for the table in {@link OutputTable2}
type CondensedFarmDataWithPubKey = CondensedFarmData & {
  pubKey: string
}

/// @dev The Raw device data from the GCA Server for a single device
/// @dev PowerOutputs and ImpactRates are arrays of length 2016
type DeviceRaw = {
  PublicKey: number[]
  PowerOutputs: number[]
  ImpactRates: number[]
}

//Conversation With @DavidVorick
// for farm {
//   weight := 0
//   val := 0
//   for slot {
//       slotWeight := power(farm, slot)
//       weight += slotWeight
//       val += (impactRate(farm, slot) * slotWeight)
//   }
//   print("farm impact rate: ", val/weight)
// }

/**
 *
 * @param device  the device response from the GCA Server
 * @param startSlot - the slot to start at
 * @param endSlot  - the slot to end at(inclusive)
 * @returns {CondensedFarmData} - the condensed farm data
 */
function getCondensedDataFromDeviceRaw(
  device: DeviceRaw,
  startSlot: number,
  endSlot: number
): CondensedFarmData {
  let sumOfImpactPoints = 0 //val
  let sumOfCredits = 0
  let sumOfPowerOutputs = 0 //weight
  for (let i = startSlot; i <= endSlot; ++i) {
    const powerOutput = device.PowerOutputs[i] //slotWeight
    if (SENTINEL_VALUES.includes(powerOutput)) continue //Don't count sentinel values
    const impactRate = device.ImpactRates[i]
    sumOfImpactPoints += impactRate * powerOutput //val += (impactRate(farm, slot) * slotWeight)
    sumOfCredits += calculateCreditsFromImpactPointsAndPowerOutput(
      impactRate,
      powerOutput
    )
    sumOfPowerOutputs += powerOutput //weight += slotWeight
  }
  const rollingImpactPoints =
    sumOfPowerOutputs == 0 ? 0 : sumOfImpactPoints / sumOfPowerOutputs
  // print("farm impact rate: ", val/weight)
  return {
    rollingImpactPoints: rollingImpactPoints,
    carbonCreditsProduced: sumOfCredits,
    powerOutput: sumOfPowerOutputs,
  }
}

/**
 *
 * @param impactPoints - the impact points
 * @param powerOutput - the power output
 * @returns {number} - the credits produced
 */
function calculateCreditsFromImpactPointsAndPowerOutput(
  impactPoints: number,
  powerOutput: number
): number {
  return (impactPoints * powerOutput) / 10 ** 15
}

/**
 *
 * @param weekNumber  - the week number to get the timestamp for
 * @param index - the index of the 5 minute slot
 * @returns {number} - the timestamp in milliseconds
 */
function getTimestampFromWeekNumber(weekNumber: number, index: number): number {
  const indexTimesFiveMinutes = index * 5 * 60 * 1000 // 5 minutes in milliseconds
  const SECONDS_IN_WEEK = 604800
  //Do current week number minus one, and then add the index times 5 minutes
  const timestamp =
    GENESIS_TIMESTAMP * 1000 +
    weekNumber * SECONDS_IN_WEEK * 1000 +
    indexTimesFiveMinutes
  return timestamp
}

function OutputTable2({
  condensedFarmData,
}: {
  condensedFarmData: CondensedFarmDataWithPubKey[]
}) {
  return (
    <>
      <Table className="bg-white rounded-lg mt-8">
        <TableCaption>All farms on this week</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Farm ID</TableHead>
            <TableHead>Power Output (Kilowatt Hours)</TableHead>
            <TableHead>Impact Rates</TableHead>
            <TableHead className="text-right">Total Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {condensedFarmData.map((d) => {
            return (
              <>
                <TableRow>
                  <TableCell className="font-medium">{d.pubKey}</TableCell>
                  <TableCell>{d.powerOutput / 1e6}</TableCell>
                  <TableCell>{d.rollingImpactPoints}</TableCell>
                  <TableCell className="text-right">
                    {d.carbonCreditsProduced.toFixed(4)}
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
    condenseDataArray: CondensedFarmDataWithPubKey[]
  }> {
    //@ts-ignore
    if (!url) return undefined
    const weekTimes2016 = weekNumber * 2016
    // alert(weekTimes2016)
    const fullUrl = `${PROXY_URL}/${url}?timeslot_offset=${weekTimes2016}`

    let dataForWeekBeforeJson: GCAServerResponse | undefined = undefined
    if (weekNumber > 0) {
      const dataForWeekBefore = await fetch(
        `${PROXY_URL}/${url}?timeslot_offset=${weekTimes2016 - 2016}`
      )
      dataForWeekBeforeJson =
        (await dataForWeekBefore.json()) as GCAServerResponse
    }
    const res = await fetch(fullUrl)
    const data = (await res.json()) as GCAServerResponse
    // console.log({ data })
    let sumOfAllCredits: number = 0
    const aggregateChartData: AggregateChartData[] = []
    const currentSlot = getSlotForCurrentWeek()

    const farmPubKeyToRollingImpactPointsMap: Map<string, CondensedFarmData> =
      new Map()
    const allPastDevices = dataForWeekBeforeJson?.Devices ?? []
    for (const device of allPastDevices) {
      const pubKey = farmPubKeyToId(device.PublicKey)
      //For the past data, that week has fully pased, so we get the end of the week [2015]
      // to the matching window such that the current week is [0, currentSlot] and the past week is [2015 - currentSlot, 2015]
      //That makes sure we have enough data to calculate the 7 day rolling impact points
      const condensedData = getCondensedDataFromDeviceRaw(
        device,
        2015 - currentSlot,
        2015
      )
      farmPubKeyToRollingImpactPointsMap.set(pubKey, condensedData)
    }

    const currentWeekFarmsRollingImpactPointsMap: Map<
      string,
      CondensedFarmData
    > = new Map()
    const allCurrentDevices = data.Devices
    /**
     * For each device, we need to calculate the rolling impact points
     */
    for (const device of allCurrentDevices) {
      const pubKey = farmPubKeyToId(device.PublicKey)
      //Get the condensed data for the current week from [0, currentSlot]
      const condensedData = getCondensedDataFromDeviceRaw(
        device,
        0,
        currentSlot
      )
      //Now add the past week's impact points if it exists
      const pastWeekImpactPoints =
        farmPubKeyToRollingImpactPointsMap.get(pubKey)
      if (pastWeekImpactPoints) {
        // Only increment the current week
        condensedData.rollingImpactPoints +=
          pastWeekImpactPoints.rollingImpactPoints

        // NOTE: DO NOT INCREMENT THE CREDITS IN THIS WEEK
        // The only rolling window is the impact points
      }
      currentWeekFarmsRollingImpactPointsMap.set(pubKey, {
        rollingImpactPoints: condensedData.rollingImpactPoints,
        carbonCreditsProduced: condensedData.carbonCreditsProduced,
        powerOutput: condensedData.powerOutput,
      })
    }
    /// @dev the impact rates length should always be 2016
    for (let i = 0; i < data.Devices[0].ImpactRates.length; ++i) {
      const timestamp = getTimestampFromWeekNumber(weekNumber, i)
      let sumOfCredits = 0
      for (let j = 0; j < data.Devices.length; j++) {
        const device = data.Devices[j]
        if (SENTINEL_VALUES.includes(device.PowerOutputs[i])) continue
        const credits = calculateCreditsFromImpactPointsAndPowerOutput(
          device.ImpactRates[i],
          device.PowerOutputs[i]
        )

        sumOfCredits += credits
        sumOfAllCredits += credits
      }
      aggregateChartData.push({
        timestamp,
        credits: sumOfCredits,
      })
    }

    const condenseDataArrayNonsorted: CondensedFarmDataWithPubKey[] =
      Array.from(currentWeekFarmsRollingImpactPointsMap.entries()).map(
        ([pubKey, farmData]) => ({
          pubKey,
          ...farmData,
        })
      )

    //Sort by credits descending
    const condenseDataArray = condenseDataArrayNonsorted.sort((a, b) => {
      return b.carbonCreditsProduced - a.carbonCreditsProduced
    })

    setTotalCredits(sumOfAllCredits.toFixed(4))
    return {
      aggregateChartData,
      condenseDataArray: condenseDataArray,
    }
  }

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
        {statsForWeekQuery.data?.condenseDataArray && (
          <>
            {/* <div className="flex justify-center items-center">
              <OutputTable data={statsForWeekQuery.data?.data!} />
            </div> */}
            <div className="flex justify-center items-center">
              <OutputTable2
                condensedFarmData={statsForWeekQuery.data?.condenseDataArray!}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// function OutputTable({ data }: { data: GCAServerResponse }) {
//   const [dataSortedByCredits, setDataSortedByCredits] =
//     useState<GCAServerResponse>(data)
//   React.useEffect(() => {
//     const dataSortedByCredits = { ...data }
//     dataSortedByCredits.Devices.sort((a, b) => {
//       let aTotalCredits = 0
//       let bTotalCredits = 0
//       for (let i = 0; i < a.ImpactRates.length; ++i) {
//         const impactPoints = a.ImpactRates[i]
//         const powerOutput = a.PowerOutputs[i]
//         if (SENTINEL_VALUES.includes(powerOutput)) continue
//         aTotalCredits += (impactPoints * powerOutput) / 10 ** 15
//       }
//       for (let i = 0; i < b.ImpactRates.length; ++i) {
//         const impactPoints = b.ImpactRates[i]
//         const powerOutput = b.PowerOutputs[i]
//         if (SENTINEL_VALUES.includes(powerOutput)) continue
//         bTotalCredits += (impactPoints * powerOutput) / 10 ** 15
//       }
//       return bTotalCredits - aTotalCredits
//     })
//     setDataSortedByCredits(dataSortedByCredits)
//   }, [data])
//   return (
//     <>
//       <Table className="bg-white rounded-lg mt-8">
//         <TableCaption>All farms on this week</TableCaption>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[100px]">Farm ID</TableHead>
//             <TableHead>Power Output (Kilowatt Hours)</TableHead>
//             <TableHead>Impact Rates</TableHead>
//             <TableHead className="text-right">Total Credits</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {dataSortedByCredits.Devices.map((device) => {
//             const pubKey = farmPubKeyToId(device.PublicKey)
//             let totalImpactPoints = 0
//             let totalPowerOutputs = 0
//             let totalCredits = 0
//             for (let i = 0; i < device.ImpactRates.length; ++i) {
//               const impactPoints = device.ImpactRates[i]
//               const powerOutput = device.PowerOutputs[i]
//               if (SENTINEL_VALUES.includes(powerOutput)) continue
//               totalImpactPoints += impactPoints
//               totalPowerOutputs += powerOutput
//               totalCredits += (impactPoints * powerOutput) / 10 ** 15
//             }

//             return (
//               <>
//                 <TableRow>
//                   <TableCell className="font-medium">{pubKey}</TableCell>
//                   <TableCell>{totalPowerOutputs / 1e6}</TableCell>
//                   <TableCell>{totalImpactPoints}</TableCell>
//                   <TableCell className="text-right">
//                     {totalCredits.toFixed(4)}
//                   </TableCell>
//                 </TableRow>
//               </>
//             )
//           })}
//           {/* <TableCell className="font-medium">INV001</TableCell>
//             <TableCell>Paid</TableCell>
//             <TableCell>Credit Card</TableCell>
//             <TableCell className="text-right">$250.00</TableCell> */}
//         </TableBody>
//       </Table>
//     </>
//   )
// }
