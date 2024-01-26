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
import { getSlotIndexForSelectedWeek } from '@/utils/getSlotForCurrentWeek'
import { SENTINEL_VALUES } from '@/constants/sentinel-values'
import { CREDIT_MULTIPLIER } from '@/constants/credit-multiplier'
import { sumOfArray } from '@/utils/sumOfArray'
import { currentGcaUrl } from '@/constants/current-gca-url'
import {
  ServerDataResponse,
  getServerDataForFarmAndWeights,
} from '@/utils/getFarmServerDataAndWeights'
import { formatNumber } from '@/utils/formatNumber'
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

type CondensedFarmDataAndGlowRewards = CondensedFarmData & {
  glowRewards: number
}
type PastWeekArrayData = {
  ImpactPoints: number[]
  PowerOutputs: number[]
}
/// @dev Used for the table in {@link OutputTable2}
type CondensedFarmDataWithPubKeyAndGlowRewards =
  CondensedFarmDataAndGlowRewards & {
    pubKey: string
  }

/// @dev The Raw device data from the GCA Server for a single device
/// @dev PowerOutputs and ImpactRates are arrays of length 2016
type DeviceRaw = {
  PublicKey: number[]
  PowerOutputs: number[]
  ImpactRates: number[]
}

function totalGlowRewardsForWeek() {
  return 175_000
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
 * @param impactRates - the impact rates to use
 * @param powerOutputs - the power outputs to use
 * @returns {CondensedFarmData} - the condensed farm data
 */
function getCondensedDataFromImpactPointsAndPowerOutputs(
  impactRatess: number[],
  powerOutputs: number[]
): CondensedFarmData {
  // console.log(length)
  console.log('impactRatess', impactRatess.length)
  if (impactRatess.length !== powerOutputs.length)
    throw new Error('Impact rates and power outputs must be the same length')
  let sumOfImpactPoints = 0 //val
  let sumOfCredits = 0
  let sumOfPowerOutputs = 0 //weight
  for (let i = 0; i < impactRatess.length; ++i) {
    const powerOutput = powerOutputs[i] //slotWeight
    if (SENTINEL_VALUES.includes(powerOutput)) continue //Don't count sentinel values
    const impactRateRaw = impactRatess[i]
    sumOfImpactPoints += impactRateRaw * powerOutput //val += (impactRate(farm, slot) * slotWeight)
    sumOfCredits += calculateCreditsFromImpactPointsAndPowerOutput(
      impactRateRaw,
      powerOutput
    )
    sumOfPowerOutputs += powerOutput //weight += slotWeight
  }
  const rollingImpactPoints =
    sumOfPowerOutputs == 0 ? 0 : sumOfImpactPoints / sumOfPowerOutputs //val/weight and prevent divide by zero
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
  weekNumber: weekNumber,
}: {
  condensedFarmData: CondensedFarmDataWithPubKeyAndGlowRewards[]
  weekNumber: number
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
            <TableHead className="">Total Credits</TableHead>
            <TableHead className="text-right">
              {weekNumber === getProtocolWeek()
                ? 'Glow Rewards(Estimated)'
                : 'Glow Rewards'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {condensedFarmData.map((d) => {
            return (
              <>
                <TableRow>
                  <TableCell className="font-medium">{d.pubKey}</TableCell>
                  <TableCell>{(d.powerOutput / 1e6).toFixed(2)}</TableCell>
                  <TableCell>
                    {/** The display needs to be multiplied by the credit multiplier*/}
                    {Math.floor(
                      (d.rollingImpactPoints * CREDIT_MULTIPLIER) / 1e3
                    )}
                  </TableCell>
                  <TableCell className="">
                    {(d.carbonCreditsProduced * CREDIT_MULTIPLIER).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(d.glowRewards)}
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
        label: `Production`,
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
        queryFn: () => getCreditsForWeek(currentGcaUrl, weekNumber),
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
                data: aggregateChartData.map((d) => d.credits * 2016),
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
    condenseDataArray: CondensedFarmDataWithPubKeyAndGlowRewards[]
  }> {
    let totalGlowWeight = 0
    //@ts-ignore
    if (!url) return undefined
    const weekTimes2016 = weekNumber * 2016
    // alert(weekTimes2016)
    const fullUrl = `${PROXY_URL}/${url}?timeslot_offset=${weekTimes2016}`
    console.log('fullUrl', fullUrl)

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
    const glowRewards = await getServerDataForFarmAndWeights(
      url,
      weekNumber,
      true
    )
    if (!glowRewards) throw new Error('Glow Rewards is undefined')
    const glowRewardsMap = new Map<string, Omit<ServerDataResponse, 'device'>>()
    for (const glowReward of glowRewards) {
      totalGlowWeight += glowReward.glowWeight
      glowRewardsMap.set(glowReward.device, glowReward)
    }
    let sumOfAllCredits: number = 0
    const aggregateChartData: AggregateChartData[] = []
    const currentSlot = getSlotIndexForSelectedWeek(weekNumber)

    const farmPubKeyToRollingImpactPointsMap: Map<string, PastWeekArrayData> =
      new Map()
    const allPastDevices = dataForWeekBeforeJson?.Devices ?? []
    for (const device of allPastDevices) {
      const pubKey = farmPubKeyToId(device.PublicKey)
      //For the past data, that week has fully pased, so we get the end of the week [2015]
      // to the matching window such that the current week is [0, currentSlot] and the past week is [2015 - currentSlot, 2015]
      //That makes sure we have enough data to calculate the 7 day rolling impact points
      // const condensedData = getCondensedDataFromDeviceRaw(
      //   device,
      //   2015 - currentSlot,
      //   2015
      // )

      const impactPoints: number[] = []
      const powerOutput: number[] = []
      for (let i = 2015; i > currentSlot; --i) {
        impactPoints.push(device.ImpactRates[i])
        powerOutput.push(device.PowerOutputs[i])
      }

      farmPubKeyToRollingImpactPointsMap.set(pubKey, {
        ImpactPoints: impactPoints,
        PowerOutputs: powerOutput,
      })
    }

    const currentWeekFarmsRollingImpactPointsMap: Map<
      string,
      CondensedFarmDataAndGlowRewards
    > = new Map()
    const allCurrentDevices = data.Devices
    /**
     * For each device, we need to calculate the rolling impact points
     */
    for (const device of allCurrentDevices) {
      const pubKey = farmPubKeyToId(device.PublicKey)
      //Get the condensed data for the current week from [0, currentSlot]
      const impactPoints: number[] = []
      const powerOutputs: number[] = []
      const { carbonCreditsProduced } =
        getCondensedDataFromImpactPointsAndPowerOutputs(
          device.ImpactRates,
          device.PowerOutputs
        ) //The carbon credits rae not rolling, so we only choose this week

      // const powerOutout = calculateCreditsFromImpactPointsAndPowerOutput(device.ImpactRates, device.PowerOutputs)
      for (let i = 0; i <= currentSlot; ++i) {
        impactPoints.push(device.ImpactRates[i])
        powerOutputs.push(device.PowerOutputs[i])
      }

      const pastData = farmPubKeyToRollingImpactPointsMap.get(pubKey)
      if (pastData) {
        for (let i = 0; i < pastData.ImpactPoints.length; ++i) {
          impactPoints.push(pastData.ImpactPoints[i])
          powerOutputs.push(pastData.PowerOutputs[i])
        }
      }
      const condensedData = getCondensedDataFromImpactPointsAndPowerOutputs(
        impactPoints,
        powerOutputs
      )

      const onlyThisWeekPowerOutput = device.PowerOutputs
      const onlyThisWeekImpactPoints = device.ImpactRates
      const sumOfThisWeeksPowerOutput = sumOfArray(onlyThisWeekPowerOutput)
      const sumOfThisWeeksImpactPoints = sumOfArray(onlyThisWeekImpactPoints)
      let glowRewardsForFarm = 0
      const glowReward = glowRewardsMap.get(farmPubKeyToId(device.PublicKey))
      if (glowReward) {
        glowRewardsForFarm =
          (glowReward.glowWeight * totalGlowRewardsForWeek()) / totalGlowWeight
      }
      //Also set

      currentWeekFarmsRollingImpactPointsMap.set(pubKey, {
        rollingImpactPoints: condensedData.rollingImpactPoints,
        carbonCreditsProduced: carbonCreditsProduced, //! Only for this week
        powerOutput: sumOfThisWeeksPowerOutput,
        glowRewards: glowRewardsForFarm,
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

    const condenseDataArrayNonsorted: CondensedFarmDataWithPubKeyAndGlowRewards[] =
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
            {statsForWeekQuery.isLoading
              ? 'Loading...'
              : (typeof totalCredits === 'number'
                  ? (totalCredits * CREDIT_MULTIPLIER).toFixed(4)
                  : (parseFloat(totalCredits) * CREDIT_MULTIPLIER).toFixed(4)) +
                ' '}
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
                weekNumber={weekNumber}
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
