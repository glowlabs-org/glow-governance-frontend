import { PROXY_URL } from '@/constants/proxy-url'
import {
  EquipmentDetails,
  GCAEquipmentResponse,
} from '@/types/GCAEquipmentResponse'
import { GCAServerResponse } from '@/types/GCAServerResponse'
import { farmPubKeyToId } from './farmPubKeyToId'
import { calculateVestingAmountForWeek } from './calculateVestingAmountForWeek'
import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'
import { calculateCredits } from './calculateCredits'

export type ServerDataResponse = {
  device: string
  powerOutput: number
  impactRate: number
  credits: number
  glowWeight: number
}

export async function getServerDataForFarmAndWeights(
  url: string,
  weekNumber: number,
  chooseWeekNumberMinusOne: boolean
) {
  if (!url) return undefined
  if (!url.includes('http')) return undefined //TODO: Adjust this as needed
  let weekNumberMinus1 = chooseWeekNumberMinusOne ? weekNumber - 1 : weekNumber
  if (weekNumberMinus1 < 0) weekNumberMinus1 = 0
  const weekTimes2016 = weekNumberMinus1 * 2016
  // alert(weekTimes2016)
  const fullUrl = `${PROXY_URL}/${url}?timeslot_offset=${weekTimes2016}`
  const equipmentUrl =
    (PROXY_URL + '/' + url).split('/all-device-stats')[0] + '/equipment'

  //make a promise.all
  const [equipmentDataRes, res] = await Promise.all([
    fetch(equipmentUrl),
    fetch(fullUrl),
  ])

  // const responseMap = new Map<ServerDataResponse & { glowWeight: string }>()
  const equipmentData = (await equipmentDataRes.json()) as GCAEquipmentResponse
  const equipmentDataMap = new Map<string, EquipmentDetails>()
  const equipmentDetailsKeys = Object.keys(equipmentData.EquipmentDetails)
  for (let i = 0; i < equipmentDetailsKeys.length; i++) {
    const key = equipmentDetailsKeys[i]
    const value = equipmentData.EquipmentDetails[key]
    if (value) {
      equipmentDataMap.set(farmPubKeyToId(value.PublicKey), value)
    }
  }
  const data = (await res.json()) as GCAServerResponse
  // console.log('full url = ', fullUrl)
  // console.log({ data })
  // console.log({ data })
  //TODO: calculate impact points the same way that /src/output.tsx does with the multiplier
  //TODO: refactor a getServerData so we can reuse it in the gca page
  const serverData: ServerDataResponse[] = data.Devices.map((device, index) => {
    const { credits, powerOutputsSum, impactRatesSum } = calculateCredits(
      device.PowerOutputs,
      device.ImpactRates
    )
    let glowWeight = 0
    const equipmentDetails = equipmentDataMap.get(
      farmPubKeyToId(device.PublicKey)
    )
    if (!equipmentDetails) {
      console.log('equipmentDetails not found for ', device.PublicKey)
    } else {
      const donationSlot = equipmentDetails.Initialization
      const matchingTimestamp = GENESIS_TIMESTAMP + donationSlot * 300
      glowWeight = calculateVestingAmountForWeek({
        currentTimestamp: Date.now() / 1000,
        genesisTimestamp: GENESIS_TIMESTAMP,
        joinTimestamp: matchingTimestamp,
        totalVestingAmount: equipmentDetails.ProtocolFee,
        totalVestingWeeks: 192,
        vestingOffset: 0,
      })
      //Remove it from the map
      equipmentDataMap.delete(farmPubKeyToId(device.PublicKey))
      //
    }

    // console.log('------------------')
    // console.log('pubkey', farmPubKeyToId(device.PublicKey))
    // console.log(powerOutputsSum, impactRatesSum)
    return {
      device: farmPubKeyToId(device.PublicKey),
      powerOutput: powerOutputsSum,
      impactRate: impactRatesSum,
      credits: credits,
      glowWeight: glowWeight,
    }
  })

  // //Loop through all the farms that are left, and if they have a glow weight > 0, add them to the server data
  const values = Array.from(equipmentDataMap.values())
  for (const equipmentDetails of values) {
    const donationSlot = equipmentDetails.Initialization
    const matchingTimestamp = GENESIS_TIMESTAMP + donationSlot * 300
    const glowWeight = calculateVestingAmountForWeek({
      currentTimestamp: Date.now() / 1000,
      genesisTimestamp: GENESIS_TIMESTAMP,
      joinTimestamp: matchingTimestamp,
      totalVestingAmount: equipmentDetails.ProtocolFee,
      totalVestingWeeks: 192,
      vestingOffset: 16,
    })
    if (glowWeight > 0) {
      serverData.push({
        device: farmPubKeyToId(equipmentDetails.PublicKey),
        powerOutput: 0,
        impactRate: 0,
        credits: 0,
        glowWeight: glowWeight,
      })
    }
  }
  return serverData
}
