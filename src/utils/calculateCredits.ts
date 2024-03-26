import { SENTINEL_VALUES } from '@/constants/sentinel-values'

export const calculateCredits = (
  powerOutputs: number[],
  impactRates: number[]
) => {
  let powerOutputsSum = 0
  let impactRatesSum = 0
  let credits = 0
  let totalDataPoints = 0
  if (powerOutputs.length !== impactRates.length)
    throw new Error('powerOutputs and impactRates must be the same length')
  for (let i = 0; i < powerOutputs.length; i++) {
    const powerOutput = powerOutputs[i]
    if (SENTINEL_VALUES.includes(powerOutput)) continue
    const impactRate = impactRates[i]
    powerOutputsSum += powerOutput
    impactRatesSum += impactRate
    credits += (powerOutput * impactRate) / 10 ** 15
    if (powerOutput !== 0) totalDataPoints++
  }
  // console.log({ totalDataPoints })

  return {
    credits,
    powerOutputsSum,
    impactRatesSum,
  }
}
