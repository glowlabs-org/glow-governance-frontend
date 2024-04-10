import React, { useEffect, useMemo, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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

const dataFilters = ['credits', 'power', 'impact']
type DataFilter = (typeof dataFilters)[number]

async function getWeeklyReportTableData(
  url: string,
  week: number,
  filteredFarmIds: number[] | null = null,
  dataType: DataFilter = 'credits'
) {
  const rewards = 175_000
  const {
    filteredFarms,
    usdgRewardNormalized,
    allShortIdsForWeek,
    sumOfCreditsProduced,
    sumOfGlowWeights,
  } = await getWeeklyReportsData(url, week, true, filteredFarmIds)
  const sortedByCarbonCreditProduction = filteredFarms.sort(
    (a, b) => b.carbonCreditsProduced - a.carbonCreditsProduced
  )

  const values = sortedByCarbonCreditProduction.map((row) => [
    row.shortId.toString(),
    formatNumber(row.powerOutput, 2),
    formatNumber(row.rollingImpactPoints, 0),
    formatNumber(row.carbonCreditsProduced, 4),
    formatNumber((row.weeklyPayment / sumOfGlowWeights) * rewards, 2),
    formatNumber(
      usdgRewardNormalized * (row.carbonCreditsProduced / sumOfCreditsProduced)
    ),
  ])

  //Next, we need to find the cum-sum of credits produced per slot
  //Each farm has a powerOutputs[2016] array
  let chartData: ChartData[] = new Array(2016).fill(0)
  for (let i = 0; i < 2016; i++) {
    chartData[i] = {
      timestamp: slotToTimestamp(week, i),
      cumSumPerSlot: sumOfArray(
        filteredFarms.map((row) => {
          if (dataType === 'credits') {
            return ((row.powerOutputs[i] * row.impactRates[i]) / 1e15) * 2016
          } else if (dataType === 'power') {
            return row.powerOutputs[i]
          } else {
            return row.impactRates[i]
          }
        })
      ),
    }
  }

  return { values, chartData, sumOfCreditsProduced, allShortIdsForWeek }
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
  return (
    <div className="flex items-center justify-center flex-col min-h-[90vh]">
      <h2 className="sm:text-3xl text-center">
        This page has been migrated to the new dashboard. Click the button below
        to go to the new page.
      </h2>
      <Button size="lg" className="mt-4">
        <Link href="https://glow.org/weekly-reports">Go To New Dashboard</Link>
      </Button>
    </div>
  )
}

export default WeeklyReport
