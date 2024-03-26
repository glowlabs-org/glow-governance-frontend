import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'

/**
 *
 * @param weekNumber - The week number
 * @param slot  - The slot number in the week (max 2015)
 * @returns The timestamp of the slot
 */
export const slotToTimestamp = (weekNumber: number, slot: number) => {
  const SLOT_DURATION = 300
  const WEEK_DURATION = 2016 * SLOT_DURATION
  const timestamp =
    GENESIS_TIMESTAMP + weekNumber * WEEK_DURATION + slot * SLOT_DURATION
  return timestamp
}
