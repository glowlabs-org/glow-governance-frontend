import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'

const FIVE_MINUTES_IN_SECONDS = 300
export const getSlotForCurrentWeek = () => {
  //Slots are 5 minutes long and there are 2016 slots in a week
  const secondsSinceGenesis = new Date().getTime() / 1000 - GENESIS_TIMESTAMP
  const slotsSinceGenesis = Math.floor(
    secondsSinceGenesis / FIVE_MINUTES_IN_SECONDS
  )
  const slotsSinceLastWeek = slotsSinceGenesis % 2016
  return slotsSinceLastWeek
}
