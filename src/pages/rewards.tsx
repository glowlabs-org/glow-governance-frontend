import React from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createPublicClient, http, isAddress } from 'viem'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetStaticPropsContext } from 'next'
import { mainnet } from 'wagmi/chains'
import { getProtocolWeek } from '@/utils/getProtocolWeek'
import {
  RewardWithWeekSerialized,
  getWeeklyRewardsForWeeksMulticall,
} from '@/multicalls/view/getWeeklyRewardsForWeeksMulticall'

const Rewards = ({
  rewards,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <main className="container">
      <div className="mx-auto py-12">
        <h1 className="font-bold text-4xl mb-4">
          USDG Rewards By Protocol Week
        </h1>
        <h2 className="mb-4 text-xl">
          Current Protocol Week: {getProtocolWeek()}
        </h2>
        <Table className="bg-white rounded-lg ">
          <TableCaption>USDG Rewards Pool</TableCaption>
          <TableHeader>
            <TableRow className="px-4">
              <TableHead>Protocol Week #</TableHead>
              <TableHead>Amount(USDG)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward) => (
              <TableRow key={reward.weekNumber}>
                <TableCell>{reward.weekNumber}</TableCell>
                <TableCell>
                  $
                  {Number(
                    formatUnits(reward.amountInBucket, 6)
                  ).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}

export default Rewards

export const getStaticProps = (async (ctx: GetStaticPropsContext) => {
  const transport = http(process.env.PRIVATE_RPC_URL!)
  const viemClient = createPublicClient({
    transport: transport,
    chain: mainnet, //need mainnet import for the multicll
  })

  const currentWeek = getProtocolWeek()
  const lastWeekToFetch = currentWeek + 208
  const rewards = await getWeeklyRewardsForWeeksMulticall({
    client: viemClient,
    weekStart: currentWeek,
    weekEnd: lastWeekToFetch,
  })
  //   const rewardsW
  const props = {
    rewards,
  }
  return { props, revalidate: 30 }
}) satisfies GetStaticProps<{
  rewards: RewardWithWeekSerialized[]
}>
