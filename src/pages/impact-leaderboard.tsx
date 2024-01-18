import {
  GetImpactPointsLeaderboardSubgraphResponse,
  getImpactPointsLeaderboard,
} from '@/subgraph/queries/getImpactPointLeaderboard'
import {
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next/types'
import React from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatUnits } from 'ethers/lib/utils'

type ImpactPointsLeaderboardProps = {
  address: string
  ens: string | null
  impactPoints: string
}
const ImpactLeaderboard = ({
  leaderboard,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <main className="container">
      <div className="mx-auto py-12">
        <h1 className="font-bold text-4xl mb-4">Impact Point Leaderboard</h1>
        <h2>Showing {leaderboard.length} results</h2>
        <Table className="bg-white rounded-lg ">
          <TableCaption>Impact Points Leaderboard</TableCaption>
          <TableHeader>
            <TableRow className="px-4">
              <TableHead>Ranking</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Impact Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((stat, index) => (
              <TableRow key={stat.address}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <a
                    target="_blank"
                    className="text-blue-500 hover:underline"
                    href={`https://etherscan.io/address/${stat.address}`}
                  >
                    {stat.ens ??
                      stat.address.slice(0, 6) + '...' + stat.address.slice(-4)}
                  </a>
                </TableCell>
                <TableCell>
                  {parseFloat(formatUnits(stat.impactPoints, 12)).toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}

export default ImpactLeaderboard

export const getStaticProps = (async (ctx: GetStaticPropsContext) => {
  const transport = http(process.env.PRIVATE_RPC_URL!)
  const viemClient = createPublicClient({
    transport: transport,
    chain: mainnet, //need mainnet import for the multicll
    batch: {
      multicall: {
        wait: 100,
      },
    },
  })

  const leaderboard: GetImpactPointsLeaderboardSubgraphResponse =
    await getImpactPointsLeaderboard()
  const ensCalls = leaderboard.users.map((user) => {
    return viemClient.getEnsName({ address: user.id as `0x${string}` })
  })
  const ensNames = await Promise.all(ensCalls)
  const modifiedLeaderboard: ImpactPointsLeaderboardProps[] =
    leaderboard.users.map((user, index) => {
      return {
        address: user.id,
        ens: ensNames[index],
        impactPoints: user.totalImpactPoints,
      }
    })
  const props = {
    leaderboard: modifiedLeaderboard,
  }
  return { props, revalidate: 60 } //revalidate every minute
}) satisfies GetStaticProps<{
  leaderboard: ImpactPointsLeaderboardProps[]
}>

//   satisfies GetStaticProps<{
//     rewards: RewardWithWeekSerialized[]
//   }>
