import React, { useEffect } from 'react'
import { useContracts } from '@/hooks/useContracts'
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber, ethers } from 'ethers'
import {
  DonationsSubgraphResponse,
  findDonationsFromAddress,
} from '@/subgraph/queries/findDonationsFromAddress'
import { useQueries } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { isAddress } from 'viem'
import { Loader2 } from 'lucide-react'
import {
  EarlyLiquidity__factory,
  USDG__factory,
  MinerPoolAndGCA__factory,
} from '@/typechain-types'
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
import { addresses } from '@/constants/addresses'
import {
  FindAllDonationsSubgraphResponse,
  findAllDonations,
} from '@/subgraph/queries/findAllDonations'
async function fetchDonations(
  address: string,
  allDonations: FindAllDonationsSubgraphResponse
): Promise<DonationsSubgraphResponse | null> {
  if (!isAddress(address)) return allDonations
  const res = await findDonationsFromAddress(address)
  //Order by block timestamp descending
  res.donations.sort((a, b) => {
    return parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)
  })
  return res
}

function computeGeometricSeries(
  firstTerm: number,
  commonRatio: number,
  numberOfTerms: number
): number {
  // Check if the common ratio is 1, as it requires a different formula
  if (commonRatio === 1) {
    return firstTerm * numberOfTerms
  }

  // Use the geometric series formula
  let sum =
    (firstTerm * (1 - Math.pow(commonRatio, numberOfTerms))) / (1 - commonRatio)
  return sum
}

const Early = ({
  totalRaised,
  totalUSDGSupply,
  allDonations,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [userAddress, setUserAddress] = React.useState<string>()

  const [donationsQuery] = useQueries({
    queries: [
      {
        queryKey: ['donations', userAddress],
        queryFn: () => fetchDonations(userAddress!, allDonations),
        // enabled:
      },
    ],
  })

  function formula(terms: number) {
    //Copilot off
    return 0.3 * 2 ** (terms / 1_000_000)
  }

  return (
    <main className="container">
      <div className="mt-12  mx-auto">
        <h1 className="font-bold text-4xl mb-4">Statistics</h1>
        <div className="bg-white rounded-lg py-4 w-full px-4 flex flex-col gap-y-3">
          <section className="">
            Total USDG Raised From Bonding Curve: $
            {totalRaised
              ? totalRaised.toLocaleString()
              : 'You must have a web3 wallet installed on your browser'}
          </section>
          <section>
            Total USDG Supply:{' '}
            {totalUSDGSupply
              ? totalUSDGSupply.toLocaleString()
              : 'You must have a web3 wallet installed on your browser'}
          </section>
        </div>
        <div></div>
      </div>
      <div className="mt-12">
        <h2 className="text-4xl font-bold">Check Your Payments</h2>
        <Input
          className="mt-4 mb-4"
          placeholder="Enter your ethereum address"
          onChange={(e) => setUserAddress(e.target.value)}
        />
      </div>
      {/* {} */}
      <Table className="bg-white rounded-lg ">
        <TableCaption>Protocol Fee Payments</TableCaption>
        <TableHeader>
          <TableRow className="px-4">
            <TableHead>Date</TableHead>
            <TableHead>Amount(USDG)</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Payer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donationsQuery.data?.donations.map((data) => (
            <TableRow key={data.id}>
              <TableCell>
                {new Date(parseInt(data.blockTimestamp) * 1000).toDateString()}
              </TableCell>
              <TableCell>
                {'$'}
                {Number(formatUnits(data.amount, 6)).toLocaleString()}
              </TableCell>
              <TableCell>
                <a
                  className=" text-blue-500"
                  //open in new tab
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://etherscan.io/tx/${data.transactionHash}`}
                >
                  {data.transactionHash.slice(0, 12) +
                    '...' +
                    data.transactionHash.slice(-4)}
                </a>
              </TableCell>
              <TableCell>
                <a
                  className="text-blue-500"
                  href={`https://etherscan.io/address/${data.user.id}`}
                >
                  {data.user.id.slice(0, 6) + '...' + data.user.id.slice(-4)}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {donationsQuery.isLoading ||
        donationsQuery.isRefetching ||
        (donationsQuery.isFetching && (
          <div className="flex justify-center mt-12">
            <Loader2 size={64} className="animate-spin h-12 w-12" />
          </div>
        ))}
    </main>
  )
}

export default Early

export const getStaticProps = (async (ctx: GetStaticPropsContext) => {
  const rpcUrl = process.env.PRIVATE_RPC_URL!
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const earlyLiquidity = EarlyLiquidity__factory.connect(
    addresses.earlyLiquidity,
    provider
  )
  const usdg = USDG__factory.connect(addresses.usdg, provider)
  const totalSold = await earlyLiquidity.totalSold()
  const totalSoldString = totalSold.toString()
  const totalSoldNumber = parseFloat(formatEther(totalSoldString))
  const totalUSDGSupply = await usdg.totalSupply()
  const totalUSDGSupplyString = totalUSDGSupply.toString()
  const totalUSDGSupplyNumber = parseFloat(
    formatUnits(totalUSDGSupplyString, 6)
  )

  const allDonations = await findAllDonations()
  // Example usage
  let firstTerm = 0.3 // First term of the series
  let commonRatio = 1.0000006931474208 // Common ratio
  const seriesSum = computeGeometricSeries(
    firstTerm,
    commonRatio,
    totalSoldNumber
  )
  const props = {
    totalRaised: seriesSum,
    totalUSDGSupply: totalUSDGSupplyNumber,
    allDonations: allDonations,
  }
  return { props, revalidate: 30 }
}) satisfies GetStaticProps<{
  totalRaised: number
  totalUSDGSupply: number
  allDonations: FindAllDonationsSubgraphResponse
}>
