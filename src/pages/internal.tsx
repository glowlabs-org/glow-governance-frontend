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
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const gccStats = [
    {
      title: 'GCC Price',
      value: gccPrice,
    },
    {
      title: 'GCC Liquidity',
      value: gccLiquidity,
    },
    {
      title: 'USDG Liquidity in GCC Pool',
      value: usdgLiquidityGCCPool,
    },
    {
      title: 'Total Liquidity in USD in GCC Pool',
      value: totalLiquidityUSDollarsGCCPool,
    },
    {
      title: 'Total Supply of GCC',
      value: totalSupplyGCC,
    },
    {
      title: 'GCC Balance in Carbon Credit Auction',
      value: carbonCreditAuctionGCCBalance,
    },
    {
      title: 'Total Supply of GCC without Carbon Credit Auction',
      value: totalSupplyGCCWithoutCarbonCreditAuction,
    },
    {
      title: 'GCC Market Cap(without Carbon Credit Auction)',
      value:
        Number(totalSupplyGCCWithoutCarbonCreditAuction) * Number(gccPrice),
    },
  ]
  const glowStats = [
    {
      title: 'Glow Price',
      value: glowPrice,
    },
    {
      title: 'Glow Liquidity',
      value: glowLiquidity,
    },
    {
      title: 'USDG Liquidity in Glow Pool',
      value: usdgLiquidityGlowPool,
    },
    {
      title: 'Total Liquidity in USD in Glow Pool',
      value: totalLiquidityUSDollarsGlowPool,
    },
    {
      title: 'Total Supply of Glow',
      value: totalSupplyGlow,
    },
    {
      title: 'Glow Balance in Carbon Credit Auction',
      value: carbonCreditAuctionGlowBalance,
    },
    {
      title: 'Glow Balance in Early Liquidity',
      value: earlyLiquidityGlowBalance,
    },
    {
      title: 'Glow Balance in Grants Treasury',
      value: grantsTreasuryGlowBalance,
    },
    {
      title: 'Total Staked',
      value: totalStaked,
    },
    {
      title: 'Total Supply of Glow without Locked Amounts',
      value: totalSupplyGlowWithoutLockedAmounts,
    },
    {
      title: 'Glow Market Cap(without Locked Amounts)',
      value: Number(totalSupplyGlowWithoutLockedAmounts) * Number(glowPrice),
    },
  ]

  const earlyLiquidityStats = [
    {
      title: 'Total Sold in Early Liquidity',
      value: totalSoldInEarlyLiquidity,
    },
    {
      title: 'Total Remaining in Early Liquidity',
      value: totalRemainingInEarlyLiquidity,
    },
    {
      title: 'Total Raised from Early Liquidity',
      value: totalRaisedFromEarlyLiquidity,
    },
    {
      title: 'Current Price in Early Liquidity',
      value: currentPriceEarlyLiquidity,
    },
  ]

  return (
    <div>
      <StatSection title="GCC Stats" stats={gccStats} />
      <StatSection title="Glow Stats" stats={glowStats} />
      <StatSection title="Early Liquidity Stats" stats={earlyLiquidityStats} />
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

  const currentPriceEarlyLiquidity = formatUnits(currentPrice, 6)

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
}>
