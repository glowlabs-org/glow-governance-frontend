import React from 'react'
import { createPublicClient, formatUnits, http, parseAbi } from 'viem'
import { PublicClient } from 'viem'
import { addresses } from '@/constants/addresses'
import { mainnet } from 'viem/chains'
import {
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next/types'
import { GCCGuardedLaunchABI } from '@/constants/abis/GCCGuardedLaunchAbi.abi'
import { EarlyLiquidityABI } from '@/constants/abis/EarlyLiquidity.abi'
import { computeTotalRaisedFromEarlyLiquidity } from '@/utils/computeTotalRaisedFromEarlyLiquidity'
import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'
import { formatNumber } from '@/utils/formatNumber'
import { earlyLiquidity } from '@/typechain-types/src/testing'
const minimalPairAbi = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
]

export const UniswapV2PairAbi = parseAbi(minimalPairAbi)
type GetReservesResponse = [bigint, bigint, number]

const gccUsdgPairAddress =
  '0xeEd0974404f635AA5E5F6e4793D1a417798F164e' as `0x${string}`
const glowUsdgPairAddress =
  '0x6fa09ffc45f1ddc95c1bc192956717042f142c5d' as `0x${string}`

function sortForAddress(
  target: string,
  other: string,
  amount0: bigint,
  amount1: bigint
) {
  return BigInt(target) < BigInt(other)
    ? [amount0, amount1]
    : [amount1, amount0]
}

const gccUsdgPair = {
  address: gccUsdgPairAddress,
  abi: UniswapV2PairAbi,
}
const glowUsdgPair = {
  address: glowUsdgPairAddress,
  abi: UniswapV2PairAbi,
}

type StatSectionsProps = {
  title: string
  stats: {
    title: string
    value: string | number
  }[]
}

const StatSection = ({ title, stats }: StatSectionsProps) => {
  return (
    <div className=" border my-4 rounded-lg p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex flex-col">
        {stats.map((stat) => (
          <div className="flex flex-row justify-between">
            <p className="text-xl">{stat.title}</p>
            <p className="text-xl">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const Internal = ({
  gccPrice,
  gccLiquidity,
  usdgLiquidityGCCPool,
  totalLiquidityUSDollarsGCCPool,
  totalSupplyGCC,
  carbonCreditAuctionGCCBalance,
  totalSupplyGCCWithoutCarbonCreditAuction,
  glowPrice,
  glowLiquidity,
  usdgLiquidityGlowPool,
  totalLiquidityUSDollarsGlowPool,
  totalSupplyGlow,
  carbonCreditAuctionGlowBalance,
  earlyLiquidityGlowBalance,
  grantsTreasuryGlowBalance,
  totalStaked,
  totalSupplyGlowWithoutLockedAmounts,
  totalSoldInEarlyLiquidity,
  totalRemainingInEarlyLiquidity,
  totalRaisedFromEarlyLiquidity,
  currentPriceEarlyLiquidity,
  totalGlowAmountIn_GLOW_USDGPair,
  totalGlowAmountOut_GLOW_USDGPair,
  totalUSDGAmountIn_GLOW_USDGPair,
  totalUSDGAmountOut_GLOW_USDGPair,
  totalGCCAmountIn_USDG_GCCPair,
  totalGCCAmountOut_USDG_GCCPair,
  totalUSDGAmountIn_USDG_GCCPair,
  totalUSDGAmountOut_USDG_GCCPair,
  totalImpactPoints,
  earlyLiquidityPaymentsPerWeeks,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const gccStats = [
    {
      title: 'GCC Price',
      value: formatNumber(gccPrice),
    },
    {
      title: 'GCC Liquidity',
      value: formatNumber(gccLiquidity),
    },
    {
      title: 'USDG Liquidity in GCC Pool',
      value: formatNumber(usdgLiquidityGCCPool),
    },
    {
      title: 'Total Liquidity in USD in GCC Pool',
      value: formatNumber(totalLiquidityUSDollarsGCCPool),
    },
    {
      title: 'Total Supply of GCC',
      value: formatNumber(totalSupplyGCC),
    },
    {
      title: 'GCC Balance in Carbon Credit Auction',
      value: formatNumber(carbonCreditAuctionGCCBalance),
    },
    {
      title: 'Total Supply of GCC without Carbon Credit Auction',
      value: formatNumber(totalSupplyGCCWithoutCarbonCreditAuction),
    },
    {
      title: 'GCC Market Cap(without Carbon Credit Auction)',
      value: formatNumber(
        Number(totalSupplyGCCWithoutCarbonCreditAuction) * Number(gccPrice)
      ),
    },
  ]
  const glowStats = [
    {
      title: 'Glow Price',
      value: formatNumber(glowPrice),
    },
    {
      title: 'Glow Liquidity',
      value: formatNumber(glowLiquidity),
    },
    {
      title: 'USDG Liquidity in Glow Pool',
      value: formatNumber(usdgLiquidityGlowPool),
    },
    {
      title: 'Total Liquidity in USD in Glow Pool',
      value: formatNumber(totalLiquidityUSDollarsGlowPool),
    },
    {
      title: 'Total Supply of Glow',
      value: formatNumber(totalSupplyGlow),
    },
    {
      title: 'Glow Balance in Carbon Credit Auction',
      value: formatNumber(carbonCreditAuctionGlowBalance),
    },
    {
      title: 'Glow Balance in Early Liquidity',
      value: formatNumber(earlyLiquidityGlowBalance),
    },
    {
      title: 'Glow Balance in Grants Treasury',
      value: formatNumber(grantsTreasuryGlowBalance),
    },
    {
      title: 'Total Staked',
      value: formatNumber(totalStaked),
    },
    {
      title: 'Total Supply of Glow without Locked Amounts',
      value: formatNumber(totalSupplyGlowWithoutLockedAmounts),
    },
    {
      title: 'Glow Market Cap(without Locked Amounts)',
      value: formatNumber(
        Number(totalSupplyGlowWithoutLockedAmounts) * Number(glowPrice)
      ),
    },
  ]

  const earlyLiquidityWeeklyPaymentsObjects =
    earlyLiquidityPaymentsPerWeeks.map((x) => {
      return {
        title: `Total Raised From Bonding Curve In Week ${x.id}`,
        value: formatNumber(x.totalPayments),
      }
    })

  const earlyLiquidityStats = [
    {
      title: 'Total Sold in Early Liquidity',
      value: formatNumber(totalSoldInEarlyLiquidity),
    },
    {
      title: 'Total Remaining in Early Liquidity',
      value: formatNumber(totalRemainingInEarlyLiquidity),
    },
    {
      title: 'Total Raised from Early Liquidity',
      value: formatNumber(totalRaisedFromEarlyLiquidity),
    },
    {
      title: 'Current Price in Early Liquidity',
      value: formatNumber(currentPriceEarlyLiquidity),
    },
  ]

  for (let i = 0; i < earlyLiquidityWeeklyPaymentsObjects.length; i++) {
    earlyLiquidityStats.push(earlyLiquidityWeeklyPaymentsObjects[i])
  }

  const glowUniswapStats = [
    {
      title: 'Total GLOW Amount In UniV2',
      value: formatNumber(totalGlowAmountIn_GLOW_USDGPair),
    },
    {
      title: 'Total GLOW Amount Out GLOW_USDG Pair',
      value: formatNumber(totalGlowAmountOut_GLOW_USDGPair),
    },
    {
      title: 'Total USDG Amount In GLOW_USDG Pair',
      value: formatNumber(totalUSDGAmountIn_GLOW_USDGPair),
    },
    {
      title: 'Total USDG Amount Out GLOW_USDG Pair',
      value: formatNumber(totalUSDGAmountOut_GLOW_USDGPair),
    },
  ]

  const gccUniswapStats = [
    {
      title: 'Total GCC Amount In USDG_GCC Pair',
      value: formatNumber(totalGCCAmountIn_USDG_GCCPair),
    },
    {
      title: 'Total GCC Amount Out USDG_GCC Pair',
      value: formatNumber(totalGCCAmountOut_USDG_GCCPair),
    },
    {
      title: 'Total USDG Amount In USDG_GCC Pair',
      value: formatNumber(totalUSDGAmountIn_USDG_GCCPair),
    },
    {
      title: 'Total USDG Amount Out USDG_GCC Pair',
      value: formatNumber(totalUSDGAmountOut_USDG_GCCPair),
    },
  ]

  const impactPointsStats = [
    {
      title: 'Total Impact Points',
      value: formatNumber(totalImpactPoints),
    },
  ]

  return (
    <div>
      <StatSection title="GCC Stats" stats={gccStats} />
      <StatSection title="Glow Stats" stats={glowStats} />
      <StatSection title="Early Liquidity Stats" stats={earlyLiquidityStats} />
      <StatSection title="GCC Uniswap Stats" stats={gccUniswapStats} />
      <StatSection title="Glow Uniswap Stats" stats={glowUniswapStats} />
      <StatSection title="Impact Points Stats" stats={impactPointsStats} />
    </div>
  )
}

export default Internal

async function getGCCRelatedStats(client: PublicClient) {
  const reservesGCCUSDG = (await client.readContract({
    ...gccUsdgPair,
    functionName: 'getReserves',
  })) as GetReservesResponse
  const [gccReserves, usdgReserves] = sortForAddress(
    addresses.gcc,
    addresses.usdg,
    reservesGCCUSDG[0],
    reservesGCCUSDG[1]
  )
  const gccPrice =
    Number(formatUnits(usdgReserves as bigint, 6)) /
    Number(formatUnits(gccReserves as bigint, 18))

  const gccLiquidity = Number(formatUnits(gccReserves as bigint, 18))
  const usdgLiquidity = Number(formatUnits(usdgReserves as bigint, 6))
  const totalLiquidityUSDollars = gccLiquidity * gccPrice + usdgLiquidity

  const gccContract = {
    address: addresses.gcc,
    abi: GCCGuardedLaunchABI,
  }

  const totalSupplyGCC = await client.readContract({
    ...gccContract,
    functionName: 'totalSupply',
  })

  const carbonCreditAuctionGCCBalance = (await client.readContract({
    ...gccContract,
    functionName: 'balanceOf',
    args: [addresses.carbonCreditAuction],
  })) as bigint

  const totalSupplyGCCWithoutCarbonCreditAuction =
    totalSupplyGCC - carbonCreditAuctionGCCBalance

  //Return the serialized data
  return {
    gccPrice: gccPrice.toString(),
    gccLiquidity: gccLiquidity.toString(),
    usdgLiquidityGCCPool: usdgLiquidity.toString(),
    totalLiquidityUSDollarsGCCPool: totalLiquidityUSDollars.toString(),
    totalSupplyGCC: formatUnits(totalSupplyGCC, 18),
    carbonCreditAuctionGCCBalance: formatUnits(
      carbonCreditAuctionGCCBalance,
      18
    ),
    totalSupplyGCCWithoutCarbonCreditAuction: formatUnits(
      totalSupplyGCCWithoutCarbonCreditAuction,
      18
    ),
  }
}

async function getGlowRelatedStats(client: PublicClient) {
  const reservesGlowUSDG = (await client.readContract({
    ...glowUsdgPair,
    functionName: 'getReserves',
  })) as GetReservesResponse
  const [glowReserves, usdgReserves] = sortForAddress(
    addresses.glow,
    addresses.usdg,
    reservesGlowUSDG[0],
    reservesGlowUSDG[1]
  )
  const glowPrice =
    Number(formatUnits(usdgReserves as bigint, 6)) /
    Number(formatUnits(glowReserves as bigint, 18))

  const glowLiquidity = Number(formatUnits(glowReserves as bigint, 18))
  const usdgLiquidity = Number(formatUnits(usdgReserves as bigint, 6))
  const totalLiquidityUSDollars = glowLiquidity * glowPrice + usdgLiquidity

  const glowContract = {
    address: addresses.glow,
    abi: GCCGuardedLaunchABI,
  }

  const totalSupplyGlow = await client.readContract({
    ...glowContract,
    functionName: 'totalSupply',
  })

  const carbonCreditAuctionGlowBalance = (await client.readContract({
    ...glowContract,
    functionName: 'balanceOf',
    args: [addresses.carbonCreditAuction],
  })) as bigint

  const earlyLiquidityGlowBalance = (await client.readContract({
    ...glowContract,
    functionName: 'balanceOf',
    args: [addresses.earlyLiquidity],
  })) as bigint

  const grantsTreasuryGlowBalance = (await client.readContract({
    ...glowContract,
    functionName: 'balanceOf',
    args: [addresses.grantsTreasury],
  })) as bigint

  const totalStaked = (await client.readContract({
    ...glowContract,
    functionName: 'balanceOf',
    args: [addresses.glow],
  })) as bigint

  const totalSupplyGlowWithoutLockedAmounts =
    totalSupplyGlow -
    carbonCreditAuctionGlowBalance -
    earlyLiquidityGlowBalance -
    grantsTreasuryGlowBalance -
    totalStaked

  //Return the serialized data
  return {
    glowPrice: glowPrice.toString(),
    glowLiquidity: glowLiquidity.toString(),
    usdgLiquidityGlowPool: usdgLiquidity.toString(),
    totalLiquidityUSDollarsGlowPool: totalLiquidityUSDollars.toString(),
    totalSupplyGlow: formatUnits(totalSupplyGlow, 18),
    carbonCreditAuctionGlowBalance: formatUnits(
      carbonCreditAuctionGlowBalance,
      18
    ),
    earlyLiquidityGlowBalance: formatUnits(earlyLiquidityGlowBalance, 18),
    grantsTreasuryGlowBalance: formatUnits(grantsTreasuryGlowBalance, 18),
    totalStaked: formatUnits(totalStaked, 18),
    totalSupplyGlowWithoutLockedAmounts: formatUnits(
      totalSupplyGlowWithoutLockedAmounts,
      18
    ),
  }
}
async function getDashboardParams(client: PublicClient) {
  //get the gcc stats
  const {
    gccPrice,
    gccLiquidity,
    usdgLiquidityGCCPool,
    totalLiquidityUSDollarsGCCPool,
    totalSupplyGCC,
    carbonCreditAuctionGCCBalance,
    totalSupplyGCCWithoutCarbonCreditAuction,
  } = await getGCCRelatedStats(client)

  return {
    gccPrice,
    gccLiquidity,
    usdgLiquidityGCCPool,
    totalLiquidityUSDollarsGCCPool,
    totalSupplyGCC,
    carbonCreditAuctionGCCBalance,
    totalSupplyGCCWithoutCarbonCreditAuction,
  }
}

type UniswapAggregatesAndImpactPointsSubgraphResponse = {
  totalGLOWUSDGPairAggregate: {
    totalAmountOneIn: string
    totalAmountOneOut: string
    totalAmountZeroIn: string
    totalAmountZeroOut: string
  }
  totalUSDGGCCPairAggregate: {
    totalAmountOneIn: string
    totalAmountOneOut: string
    totalAmountZeroIn: string
    totalAmountZeroOut: string
  }
  totalImpactPointsAggregate: {
    totalImpactPoints: string
  }

  earlyLiquidityPaymentsPerWeeks: {
    id: string
    totalPayments: string
  }[]
}
async function getUniswapAggregatesAndTotalImpactPoints() {
  const graphqlClient = client
  const query = gql`
    {
      totalGLOWUSDGPairAggregate(id: "1") {
        totalAmountOneIn
        totalAmountOneOut
        totalAmountZeroIn
        totalAmountZeroOut
      }

      totalUSDGGCCPairAggregate(id: "1") {
        totalAmountOneIn
        totalAmountOneOut
        totalAmountZeroIn
        totalAmountZeroOut
      }

      totalImpactPointsAggregate(id: "1") {
        totalImpactPoints
      }

      earlyLiquidityPaymentsPerWeeks(first: 100) {
        id
        totalPayments
      }
    }
  `

  const { data } =
    await graphqlClient.query<UniswapAggregatesAndImpactPointsSubgraphResponse>(
      {
        query,
      }
    )

  let totalGlowAmountIn_GLOW_USDGPair = BigInt(0)
  let totalGlowAmountOut_GLOW_USDGPair = BigInt(0)
  let totalUSDGAmountIn_GLOW_USDGPair = BigInt(0)
  let totalUSDGAmountOut_GLOW_USDGPair = BigInt(0)

  let totalGCCAmountIn_USDG_GCCPair = BigInt(0)
  let totalGCCAmountOut_USDG_GCCPair = BigInt(0)
  let totalUSDGAmountIn_USDG_GCCPair = BigInt(0)
  let totalUSDGAmountOut_USDG_GCCPair = BigInt(0)

  let totalImpactPoints = data.totalImpactPointsAggregate.totalImpactPoints

  if (BigInt(addresses.glow) > BigInt(addresses.usdg)) {
    totalGlowAmountIn_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountOneIn
    )
    totalGlowAmountOut_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountOneOut
    )
    totalUSDGAmountIn_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountZeroIn
    )
    totalUSDGAmountOut_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountZeroOut
    )
  } else {
    totalGlowAmountIn_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountZeroIn
    )
    totalGlowAmountOut_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountZeroOut
    )
    totalUSDGAmountIn_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountOneIn
    )
    totalUSDGAmountOut_GLOW_USDGPair = BigInt(
      data.totalGLOWUSDGPairAggregate.totalAmountOneOut
    )
  }

  if (BigInt(addresses.gcc) > BigInt(addresses.usdg)) {
    totalGCCAmountIn_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountOneIn
    )
    totalGCCAmountOut_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountOneOut
    )
    totalUSDGAmountIn_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountZeroIn
    )
    totalUSDGAmountOut_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountZeroOut
    )
  } else {
    totalGCCAmountIn_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountZeroIn
    )
    totalGCCAmountOut_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountZeroOut
    )
    totalUSDGAmountIn_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountOneIn
    )
    totalUSDGAmountOut_USDG_GCCPair = BigInt(
      data.totalUSDGGCCPairAggregate.totalAmountOneOut
    )
  }

  return {
    totalGlowAmountIn_GLOW_USDGPair: formatUnits(
      totalGlowAmountIn_GLOW_USDGPair,
      18
    ),
    totalGlowAmountOut_GLOW_USDGPair: formatUnits(
      totalGlowAmountOut_GLOW_USDGPair,
      18
    ),
    totalUSDGAmountIn_GLOW_USDGPair: formatUnits(
      totalUSDGAmountIn_GLOW_USDGPair,
      6
    ),
    totalUSDGAmountOut_GLOW_USDGPair: formatUnits(
      totalUSDGAmountOut_GLOW_USDGPair,
      6
    ),
    totalGCCAmountIn_USDG_GCCPair: formatUnits(
      totalGCCAmountIn_USDG_GCCPair,
      18
    ),
    totalGCCAmountOut_USDG_GCCPair: formatUnits(
      totalGCCAmountOut_USDG_GCCPair,
      18
    ),
    totalUSDGAmountIn_USDG_GCCPair: formatUnits(
      totalUSDGAmountIn_USDG_GCCPair,
      6
    ),
    totalUSDGAmountOut_USDG_GCCPair: formatUnits(
      totalUSDGAmountOut_USDG_GCCPair,
      6
    ),
    totalImpactPoints: formatUnits(BigInt(totalImpactPoints), 12),
    earlyLiquidityPaymentsPerWeeks: data.earlyLiquidityPaymentsPerWeeks.map(
      (x) => {
        return {
          id: x.id,
          totalPayments: formatUnits(BigInt(x.totalPayments), 6),
        }
      }
    ),
  }
}
async function getEarlyLiquidityStats(client: PublicClient) {
  const earlyLiquidityContract = {
    address: addresses.earlyLiquidity,
    abi: EarlyLiquidityABI,
  }

  const startingSupply = BigInt(10 ** 18) * BigInt(12_000_000)
  const totalSold = (await client.readContract({
    ...earlyLiquidityContract,
    functionName: 'totalSold',
  })) as bigint
  const remainingGlowTokensToBeSoldInEarlyLiquidity = startingSupply - totalSold

  const totalSoldInEarlyLiquidity = formatUnits(totalSold, 18)
  const totalRemainingInEarlyLiquidity = formatUnits(
    remainingGlowTokensToBeSoldInEarlyLiquidity,
    18
  )
  const totalRaisedFromEarlyLiquidity = computeTotalRaisedFromEarlyLiquidity(
    Number(totalSoldInEarlyLiquidity)
  ).toString()

  const currentPrice = (await client.readContract({
    ...earlyLiquidityContract,
    functionName: 'getPrice',
    args: [BigInt(1)],
  })) as bigint

  const currentPriceEarlyLiquidity = formatUnits(currentPrice, 4)

  return {
    totalSoldInEarlyLiquidity,
    totalRemainingInEarlyLiquidity,
    totalRaisedFromEarlyLiquidity,
    currentPriceEarlyLiquidity,
  }
}

export const getStaticProps = (async (ctx: GetStaticPropsContext) => {
  const transport = http(process.env.PRIVATE_RPC_URL!)

  const client = createPublicClient({
    transport: transport,
    chain: mainnet, //need mainnet import for the multicll
    batch: {
      multicall: {
        wait: 100,
      },
    },
  })
  const {
    gccPrice,
    gccLiquidity,
    usdgLiquidityGCCPool,
    totalLiquidityUSDollarsGCCPool,
    totalSupplyGCC,
    carbonCreditAuctionGCCBalance,
    totalSupplyGCCWithoutCarbonCreditAuction,
  } = await getDashboardParams(client)

  const {
    glowPrice,
    glowLiquidity,
    usdgLiquidityGlowPool,
    totalLiquidityUSDollarsGlowPool,
    totalSupplyGlow,
    carbonCreditAuctionGlowBalance,
    earlyLiquidityGlowBalance,
    grantsTreasuryGlowBalance,
    totalStaked,
    totalSupplyGlowWithoutLockedAmounts,
  } = await getGlowRelatedStats(client)

  const {
    totalSoldInEarlyLiquidity,
    totalRemainingInEarlyLiquidity,
    totalRaisedFromEarlyLiquidity,
    currentPriceEarlyLiquidity,
  } = await getEarlyLiquidityStats(client)

  const {
    totalGlowAmountIn_GLOW_USDGPair,
    totalGlowAmountOut_GLOW_USDGPair,
    totalUSDGAmountIn_GLOW_USDGPair,
    totalUSDGAmountOut_GLOW_USDGPair,
    totalGCCAmountIn_USDG_GCCPair,
    totalGCCAmountOut_USDG_GCCPair,
    totalUSDGAmountIn_USDG_GCCPair,
    totalUSDGAmountOut_USDG_GCCPair,
    totalImpactPoints,
    earlyLiquidityPaymentsPerWeeks,
  } = await getUniswapAggregatesAndTotalImpactPoints()

  const props = {
    gccPrice,
    gccLiquidity,
    usdgLiquidityGCCPool,
    totalLiquidityUSDollarsGCCPool,
    totalSupplyGCC,
    carbonCreditAuctionGCCBalance,
    totalSupplyGCCWithoutCarbonCreditAuction,
    glowPrice,
    glowLiquidity,
    usdgLiquidityGlowPool,
    totalLiquidityUSDollarsGlowPool,
    totalSupplyGlow,
    carbonCreditAuctionGlowBalance,
    earlyLiquidityGlowBalance,
    grantsTreasuryGlowBalance,
    totalStaked,
    totalSupplyGlowWithoutLockedAmounts,
    totalSoldInEarlyLiquidity,
    totalRemainingInEarlyLiquidity,
    totalRaisedFromEarlyLiquidity,
    currentPriceEarlyLiquidity,
    totalGlowAmountIn_GLOW_USDGPair,
    totalGlowAmountOut_GLOW_USDGPair,
    totalUSDGAmountIn_GLOW_USDGPair,
    totalUSDGAmountOut_GLOW_USDGPair,
    totalGCCAmountIn_USDG_GCCPair,
    totalGCCAmountOut_USDG_GCCPair,
    totalUSDGAmountIn_USDG_GCCPair,
    totalUSDGAmountOut_USDG_GCCPair,
    totalImpactPoints,
    earlyLiquidityPaymentsPerWeeks,
  }
  return {
    props,
    revalidate: 30,
  }
}) satisfies GetStaticProps<{
  gccPrice: string
  gccLiquidity: string
  usdgLiquidityGCCPool: string
  totalLiquidityUSDollarsGCCPool: string
  totalSupplyGCC: string
  carbonCreditAuctionGCCBalance: string
  totalSupplyGCCWithoutCarbonCreditAuction: string
  glowPrice: string
  glowLiquidity: string
  usdgLiquidityGlowPool: string
  totalLiquidityUSDollarsGlowPool: string
  totalSupplyGlow: string
  carbonCreditAuctionGlowBalance: string
  earlyLiquidityGlowBalance: string
  grantsTreasuryGlowBalance: string
  totalStaked: string
  totalSupplyGlowWithoutLockedAmounts: string
  totalSoldInEarlyLiquidity: string
  currentPriceEarlyLiquidity: string
  totalGlowAmountIn_GLOW_USDGPair: string
  totalGlowAmountOut_GLOW_USDGPair: string
  totalUSDGAmountIn_GLOW_USDGPair: string
  totalUSDGAmountOut_GLOW_USDGPair: string
  totalGCCAmountIn_USDG_GCCPair: string
  totalGCCAmountOut_USDG_GCCPair: string
  totalUSDGAmountIn_USDG_GCCPair: string
  totalUSDGAmountOut_USDG_GCCPair: string
  totalImpactPoints: string
  earlyLiquidityPaymentsPerWeeks: {
    id: string
    totalPayments: string
  }[]
}>
