export type CalculateAmountVestedInWeekArgs = {
  genesisTimestamp: number
  currentTimestamp: number
  joinTimestamp: number
  totalVestingAmount: number
  totalVestingWeeks: number
  vestingOffset: number
}

export function calculateVestingAmountForWeek({
  genesisTimestamp,
  currentTimestamp,
  joinTimestamp,
  totalVestingAmount,
  totalVestingWeeks,
  vestingOffset,
}: CalculateAmountVestedInWeekArgs) {
  const currentWeekNumber = Math.floor(
    (currentTimestamp - genesisTimestamp) / 604800
  )
  const joinWeek = Math.floor((joinTimestamp - genesisTimestamp) / 604800)
  const weeksPassed = currentWeekNumber - joinWeek
  if (weeksPassed < vestingOffset) {
    return 0
  }
  if (weeksPassed >= vestingOffset + totalVestingWeeks) {
    return 0
  }
  /// @dev The glow is stored in 2 decimals of precision in the protocol fee field
  const perWeekAmount = totalVestingAmount / 1e2 / totalVestingWeeks
  const vestingAmount = perWeekAmount
  return vestingAmount
}
