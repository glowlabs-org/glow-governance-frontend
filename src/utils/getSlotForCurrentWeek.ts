import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'
import { getProtocolWeek } from './getProtocolWeek'

const FIVE_MINUTES_IN_SECONDS = 300
export const getSlotIndexForSelectedWeek = (weekNumber: number) => {
  const protocolWeek = getProtocolWeek()
  if (weekNumber < protocolWeek) {
    return 2015
  }
  //Slots are 5 minutes long and there are 2016 slots in a week
  const secondsSinceGenesis = new Date().getTime() / 1000 - GENESIS_TIMESTAMP
  const slotsSinceGenesis = Math.floor(
    secondsSinceGenesis / FIVE_MINUTES_IN_SECONDS
  )
  const slotsSinceLastWeek = slotsSinceGenesis % 2016
  return slotsSinceLastWeek
}
