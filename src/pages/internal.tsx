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
import { getWeeklyRewardsForWeeksMulticall } from '@/multicalls/view/getWeeklyRewardsForWeeksMulticall'
import { GenericTable } from '@/components/GenericTable/GenericTable'
import { CarbonCreditDescendingPriceAuctionABI } from '@/constants/abis/CarbonCreditDescendingPriceAuction.abi'
import { getGlowStats } from '@/utils/web3/getGlowStats'
import { getProtocolWeek } from '@/utils/getProtocolWeek'
const minimalPairAbi = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
]
const erc20Abi = parseAbi([
  'function balanceOf(address owner) external view returns (uint256)',
])

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
  circulatingSupplyGlow,
  marketCapGlow,
  vetoCouncilContractBalance,
  minerPoolAndGcaContractBalance,
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
  totalGCC_Committed,
  totalUSDC_Committed,
  totalUSDC_Value,
  earlyLiquidityPaymentsPerWeeks,
  protocolFeePaymentsPerWeeks,
  impactMultiplier,
  carbonCreditAuctionPrice,
  totalGCCForSaleInCarbonCreditAuction,
  totalGCCSoldInCarbonCreditAuction,
  multisigUSDCBalance,
  sumOfMinerPoolRewardsInCurrentBuckets,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const multisigStats = [
    {
      title: 'Multisig USDC Balance',
      value: formatNumber(multisigUSDCBalance),
    },
    {
      title: 'Total Available Miner Pool Rewards',
      value: formatNumber(sumOfMinerPoolRewardsInCurrentBuckets),
    },
  ]
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

  const carbonCreditAuctionStats = [
    {
      title: 'Carbon Credit Auction Price',
      value: formatNumber(carbonCreditAuctionPrice, 4) + ' Glow',
    },
    {
      title: 'Total GCC For Sale in Carbon Credit Auction',
      value: formatNumber(totalGCCForSaleInCarbonCreditAuction, 10),
    },
    {
      title: 'Total GCC Sold in Carbon Credit Auction',
      value: formatNumber(totalGCCSoldInCarbonCreditAuction, 10),
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
      title: 'Circulating Supply of Glow',
      value: formatNumber(circulatingSupplyGlow),
    },
    {
      title: 'Veto Council Contract Balance',
      value: formatNumber(vetoCouncilContractBalance),
    },
    {
      title: 'Miner Pool And GCA Contract Balance',
      value: formatNumber(minerPoolAndGcaContractBalance),
    },
    {
      title: 'Market Cap(Circulating * Price)',
      value: formatNumber(marketCapGlow, 2),
    },
    // {
    //   title: 'Total Staked',
    //   value: formatNumber(totalStaked),
    // },
    // {
    //   title: 'Total Supply of Glow without Locked Amounts',
    //   value: formatNumber(totalSupplyGlowWithoutLockedAmounts),
    // },
    // {
    //   title: 'Glow Market Cap(without Locked Amounts)',
    //   value: formatNumber(
    //     Number(totalSupplyGlowWithoutLockedAmounts) * Number(glowPrice)
    //   ),
    // },
  ]

  const tabelLables = [
    'Week',
    'Early Liquidity Payments',
    'Protocol Fee Payments',
    'Total Payments',
  ]
  const tableData: (string | number)[][] = []
  const alreadyPushedProtocolFeePayments = new Map<string, boolean>()
  for (let i = 0; i < earlyLiquidityPaymentsPerWeeks.length; i++) {
    const week = earlyLiquidityPaymentsPerWeeks[i]
    //Add the matching id only if exists
    const protocolFeePayment = protocolFeePaymentsPerWeeks.find(
      (x) => x.id === week.id
    )
    if (protocolFeePayment) {
      tableData.push([
        week.id,
        formatNumber(week.totalPayments),
        formatNumber(protocolFeePayment.totalPayments),
        formatNumber(
          Number(week.totalPayments) + Number(protocolFeePayment.totalPayments)
        ),
      ])
      alreadyPushedProtocolFeePayments.set(week.id, true)
    } else {
      tableData.push([
        week.id,
        formatNumber(week.totalPayments),
        0,
        formatNumber(Number(week.totalPayments)),
      ])
    }
  }

  //Push any protocol fee payments that were not pushed
  for (let i = 0; i < protocolFeePaymentsPerWeeks.length; i++) {
    const week = protocolFeePaymentsPerWeeks[i]
    if (!alreadyPushedProtocolFeePayments.has(week.id)) {
      tableData.push([
        week.id,
        0,
        formatNumber(week.totalPayments),
        formatNumber(Number(week.totalPayments)),
      ])
    }
  }

  //Sort by week number
  tableData.sort((a, b) => {
    return Number(a[0]) - Number(b[0])
  })
  //Find the missing weeks,  in table data and add them
  const mostRecentWeekInTableData = Number(tableData[tableData.length - 1][0])
  //Loop over 0->mostRecentWeekInTableData and add any missing weeks if they're not in the tableData
  for (let i = 0; i <= mostRecentWeekInTableData; i++) {
    const week = i.toString()
    if (!tableData.find((x) => x[0] === week)) {
      tableData.push([week, 0, 0, 0])
    }
  }
  //Sort agian by week number
  tableData.sort((a, b) => {
    return Number(a[0]) - Number(b[0])
  })

  //Reverse sort to show most recent week first
  tableData.reverse()

  const earlyLiquidityWeeklyPaymentsObjects =
    earlyLiquidityPaymentsPerWeeks.map((x) => {
      return {
        title: `Total Raised From Bonding Curve In Week ${x.id}`,
        value: formatNumber(x.totalPayments),
        id: x.id,
      }
    })

  const protocolFeeWeeklyPaymentsObjects = protocolFeePaymentsPerWeeks.map(
    (x) => {
      return {
        title: `Total Raised From Protocol Fees In Week ${x.id}`,
        value: formatNumber(x.totalPayments),
        id: x.id,
      }
    }
  )

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
      title: 'Total Impact Power',
      value: formatNumber(totalImpactPoints),
    },
    {
      title: 'Impact Multiplier',
      value: formatNumber(impactMultiplier),
    },
    {
      title: 'Total GCC Committed',
      value: formatNumber(totalGCC_Committed, 10),
    },
    {
      title: 'Total USDC Committed (Total USDC Retired)',
      value: formatNumber(totalUSDC_Committed),
    },
    {
      title: 'Total USDC Value (Total USDC Including Amount In Swaps and LP)',
      value: formatNumber(totalUSDC_Value),
    },
  ]

  return (
    <div>
      <StatSection title="GCC Stats" stats={gccStats} />
      <StatSection
        title="Carbon Credit Auction Stats"
        stats={carbonCreditAuctionStats}
      />
      <StatSection title="USDC Stats" stats={multisigStats} />
      <StatSection title="Glow Stats" stats={glowStats} />
      <StatSection title="Early Liquidity Stats" stats={earlyLiquidityStats} />
      <div className="max-w-[95%] mx-auto">
        <GenericTable
          labels={tabelLables}
          tableCaption="Farm Rewards"
          values={tableData}
        />
      </div>
      <StatSection title="GCC Uniswap Stats" stats={gccUniswapStats} />
      <StatSection title="Glow Uniswap Stats" stats={glowUniswapStats} />
      <StatSection title="Impact Power Stats" stats={impactPointsStats} />
    </div>
  )
}

export default Internal

async function getCarbonCreditAuctionPrice(client: PublicClient) {
  const unit = BigInt(1000000)
  const carbonCreditAuctionContract = {
    address: addresses.carbonCreditAuction,
    abi: CarbonCreditDescendingPriceAuctionABI,
  }
  const currentPrice =
    ((await client.readContract({
      ...carbonCreditAuctionContract,
      functionName: 'getPricePerUnit',
    })) as bigint) * unit

  const gccForSale =
    ((await client.readContract({
      ...carbonCreditAuctionContract,
      functionName: 'unitsForSale',
    })) as bigint) * unit

  const totalGCCSold =
    ((await client.readContract({
      ...carbonCreditAuctionContract,
      functionName: 'totalUnitsSold',
    })) as bigint) * unit

  return {
    currentPrice: formatUnits(currentPrice, 12),
    gccForSale: formatUnits(gccForSale, 18),
    totalGCCSold: formatUnits(totalGCCSold, 18),
  }
}

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

  const {
    totalSupply: totalSupplyGlow,
    carbonCreditAuctionBalance: carbonCreditAuctionGlowBalance,
    earlyLiquidityBalance: earlyLiquidityGlowBalance,
    grantsContractBalance: grantsTreasuryGlowBalance,
    glowStakedOrLockedBalance: totalStaked,
    marketCap: glowMarketCap,
    circulatingSupply: circulatingSupplyGlow,
    vetoCouncilContractBalance: vetoCouncilContractBalance,
    minerPoolAndGcaContractBalance: minerPoolAndGcaContractBalance,
  } = await getGlowStats(client, glowPrice)

  return {
    glowPrice: glowPrice.toString(),
    glowLiquidity: glowLiquidity.toString(),
    usdgLiquidityGlowPool: usdgLiquidity.toString(),
    totalLiquidityUSDollarsGlowPool: totalLiquidityUSDollars.toString(),
    totalSupplyGlow: totalSupplyGlow.toString(),
    carbonCreditAuctionGlowBalance: carbonCreditAuctionGlowBalance.toString(),
    earlyLiquidityGlowBalance: earlyLiquidityGlowBalance.toString(),
    grantsTreasuryGlowBalance: grantsTreasuryGlowBalance.toString(),
    totalStaked: totalStaked.toString(),
    circulatingSupplyGlow: circulatingSupplyGlow.toString(),
    vetoCouncilContractBalance: vetoCouncilContractBalance.toString(),
    minerPoolAndGcaContractBalance: minerPoolAndGcaContractBalance.toString(),
    marketCapGlow: glowMarketCap.toString(),
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
    totalUSDC_Value: string
    totalGCC_Committed: string
    totalUSDC_Committed: string
  }

  earlyLiquidityPaymentsPerWeeks: {
    id: string
    totalPayments: string
  }[]

  protocolFeePaymentsPerWeeks: {
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
        totalUSDC_Value
        totalGCC_Committed
        totalUSDC_Committed
      }

      earlyLiquidityPaymentsPerWeeks(
        first: 100
        orderBy: id
        orderDirection: asc
      ) {
        id
        totalPayments
      }

      protocolFeePaymentsPerWeeks(
        first: 100
        orderBy: id
        orderDirection: asc
      ) {
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
    totalGCC_Committed: formatUnits(
      BigInt(data.totalImpactPointsAggregate.totalGCC_Committed),
      18
    ),
    totalUSDC_Committed: formatUnits(
      BigInt(data.totalImpactPointsAggregate.totalUSDC_Committed),
      6
    ),
    totalUSDC_Value: formatUnits(
      BigInt(data.totalImpactPointsAggregate.totalUSDC_Value),
      6
    ),

    earlyLiquidityPaymentsPerWeeks: data.earlyLiquidityPaymentsPerWeeks.map(
      (x) => {
        return {
          id: x.id,
          totalPayments: formatUnits(BigInt(x.totalPayments), 6),
        }
      }
    ),
    protocolFeePaymentsPerWeeks: data.protocolFeePaymentsPerWeeks.map((x) => {
      return {
        id: x.id,
        totalPayments: formatUnits(BigInt(x.totalPayments), 6),
      }
    }),
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

async function getMultisigStats(client: PublicClient) {
  const multisigAddress =
    '0xc5174BBf649a92F9941e981af68AaA14Dd814F85' as `0x${string}`
  const usdcAddress =
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as `0x${string}`
  const usdc = {
    address: usdcAddress,
    abi: erc20Abi,
  }

  const balance = await client.readContract({
    ...usdc,
    functionName: 'balanceOf',
    args: [multisigAddress],
  })
  return {
    multisigUSDCBalance: formatUnits(balance, 6),
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
    circulatingSupplyGlow,
    marketCapGlow,
    vetoCouncilContractBalance,
    minerPoolAndGcaContractBalance,
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
    totalGCC_Committed,
    totalUSDC_Committed,
    totalUSDC_Value,
    earlyLiquidityPaymentsPerWeeks,
    protocolFeePaymentsPerWeeks,
  } = await getUniswapAggregatesAndTotalImpactPoints()

  const impactPointsUrl =
    'https://glow-green-api.simonnfts.workers.dev/estimateUSDC?amountImpactPointsDesired=1000000000000'
  const response = await fetch(impactPointsUrl)
  const data = (await response.json()) as {
    estimate: {
      amountUSDCNeededNumber: number
      amountUSDCNeededBigNumber: string
      expectedImpactPointsBigNumber: string
      expectedImpactPointsNumber: number
    }
  }

  //impactMultiplier =  ($total_protocol_fees_paid)/($price_of_one_impact_power * $total_impact_power)
  const sumOfWeeklyPayments = protocolFeePaymentsPerWeeks.reduce((acc, x) => {
    return acc + Number(x.totalPayments)
  }, 0)
  const priceOfOneImpactPower =
    data.estimate.amountUSDCNeededNumber /
    data.estimate.expectedImpactPointsNumber
  const totalImpactPower = Number(totalImpactPoints)

  const impactMultiplier =
    sumOfWeeklyPayments / (priceOfOneImpactPower * totalImpactPower)

  const {
    currentPrice: carbonCreditAuctionPrice,
    gccForSale: totalGCCForSaleInCarbonCreditAuction,
    totalGCCSold: totalGCCSoldInCarbonCreditAuction,
  } = await getCarbonCreditAuctionPrice(client)

  const currentWeek = getProtocolWeek()
  const minerPoolRewards = await getWeeklyRewardsForWeeksMulticall({
    client: client,
    weekStart: currentWeek,
    weekEnd: currentWeek + 208,
  })

  const sumOfMinerPoolRewards = minerPoolRewards.reduce((acc, x) => {
    return acc + BigInt(x.amountInBucket)
  }, BigInt(0))

  const formattedSumOfMinerPoolRewards = formatUnits(sumOfMinerPoolRewards, 6)

  const { multisigUSDCBalance } = await getMultisigStats(client)
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
    circulatingSupplyGlow,
    marketCapGlow,
    vetoCouncilContractBalance,
    minerPoolAndGcaContractBalance,
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
    totalGCC_Committed,
    totalUSDC_Committed,
    totalUSDC_Value,
    earlyLiquidityPaymentsPerWeeks,
    protocolFeePaymentsPerWeeks,
    impactMultiplier,
    carbonCreditAuctionPrice,
    totalGCCForSaleInCarbonCreditAuction,
    totalGCCSoldInCarbonCreditAuction,
    multisigUSDCBalance,
    sumOfMinerPoolRewardsInCurrentBuckets: formattedSumOfMinerPoolRewards,
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
  circulatingSupplyGlow: string
  marketCapGlow: string
  vetoCouncilContractBalance: string
  minerPoolAndGcaContractBalance: string
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
  totalGCC_Committed: string
  totalUSDC_Committed: string
  totalUSDC_Value: string
  earlyLiquidityPaymentsPerWeeks: {
    id: string
    totalPayments: string
  }[]
  protocolFeePaymentsPerWeeks: {
    id: string
    totalPayments: string
  }[]
  impactMultiplier: number
  carbonCreditAuctionPrice: string
  totalGCCForSaleInCarbonCreditAuction: string
  totalGCCSoldInCarbonCreditAuction: string
  multisigUSDCBalance: string
  sumOfMinerPoolRewardsInCurrentBuckets: string
}>
