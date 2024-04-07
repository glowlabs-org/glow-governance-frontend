import { PROXY_URL } from '@/constants/proxy-url'
import {
  EquipmentDetails,
  EquipmentDetailsAndShortId,
  GCAEquipmentResponse,
} from '@/types/GCAEquipmentResponse'
import { GCAServerResponse } from '@/types/GCAServerResponse'
import { farmPubKeyToId } from './farmPubKeyToId'
import { calculateVestingAmountForWeek } from './calculateVestingAmountForWeek'
import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'
import { calculateCredits } from './calculateCredits'
import { RUST_URL, API_URL } from '@/constants/api-url'
import { formatUnits, parseUnits } from 'viem'

export type ServerDataResponse = {
  device: string
  powerOutput: number
  impactRate: number
  credits: number
  glowWeight: number
  shortId: string
}

// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type FarmStatus =
  | { AuditCompleted: number }
  | { Banned: number }
  | { Duplicate: number }
  | 'Unassigned'

export interface Farm {
  hexlifiedPublicKey: string
  carbonCreditsProduced: number
  powerOutputs: Array<number>
  impactRates: Array<number>
  weeklyPayment: number
  rollingImpactPoints: number
  powerOutput: number
  shortId: bigint
  protocolFee: number
  payoutWallet: string
  installerWallet: string
  installerGlowFeePercent: number
  installerUsdgFeePercent: number
  status: FarmStatus
}

export interface GetEquipmentDataHandlerParams {
  url: string
  weekNumber: number
  withFullData: boolean | null
}

export async function getWeeklyReportsData(
  url: string,
  weekNumber: number,
  withFullData: boolean | null,
  filteredShortIds: number[] | null
) {
  const fetchUrl = RUST_URL + '/headline_farm_stats'
  const body = {
    urls: [url],
    week_number: weekNumber,
    with_full_data: withFullData,
  }

  const res = await fetch(fetchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const amountOfRewardsInBucketRoute =
    API_URL + '/rewards-in-bucket?bucket=' + weekNumber.toString()
  const rewardsInBucket = await fetch(amountOfRewardsInBucketRoute)
  const rewards = (await rewardsInBucket.json()) as { reward: string }
  const usdgRewardNormalized = parseInt(formatUnits(BigInt(rewards.reward), 6))
  const data = (await res.json()) as { filteredFarms: Farm[] }
  let filteredFarms = data.filteredFarms
  const allShortIdsForWeek = data.filteredFarms.map((farm) =>
    Number(farm.shortId)
  )
  const sumOfGlowWeights = data.filteredFarms.reduce((acc, farm) => {
    return acc + farm.weeklyPayment
  }, 0)

  const sumOfCreditsProduced = data.filteredFarms.reduce((acc, farm) => {
    return acc + farm.carbonCreditsProduced
  }, 0)
  if (filteredShortIds) {
    filteredFarms = data.filteredFarms.filter((farm) => {
      return filteredShortIds.includes(Number(farm.shortId))
    })
  }

  return {
    filteredFarms: filteredFarms,
    usdgRewardNormalized,
    allShortIdsForWeek,
    sumOfGlowWeights,
    sumOfCreditsProduced,
  }
}
