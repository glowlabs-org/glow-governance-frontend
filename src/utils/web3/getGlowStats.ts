import { addresses } from '@/constants/addresses'
import type { PublicClient } from 'viem'
import { formatUnits, parseAbi } from 'viem'
const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
])

/**
 * The Market Cap Of Glow Is The Total Circulating Supply Of Glow Multiplied By The Current Price Of Glow
 * We need to exclude
 *  1. balance of the carbon credit auction
 *  2. balance of grants contract
 *  3. balance of veto council contract.
 *  4. balance of miner pool and gca contract
 *  5. the total amount of staked / locked tokens in the glow contract
 *  6. Early liquidity balance
 * @param glowPrice - The current price of glow in USD ($2.70) as an example
 *
 */
export async function getGlowStats(
  publicClient: PublicClient,
  glowPrice: number
) {
  const totalSupplyCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'totalSupply',
  }
  const carbonCreditAuctionBalanceCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [addresses.carbonCreditAuction],
  }
  const grantsContractBalanceCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [addresses.grantsTreasury],
  }
  const vetoCouncilContractBalanceCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [addresses.vetoCouncilContract],
  }
  const minerPoolAndGcaContractBalanceCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [addresses.gcaAndMinerPoolContract],
  }

  const glowStakedOrLockedBalanceCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [addresses.glow],
  }

  const earlyLiquidityBalanceCall = {
    address: addresses.glow,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [addresses.earlyLiquidity],
  }

  const calls = [
    totalSupplyCall,
    carbonCreditAuctionBalanceCall,
    grantsContractBalanceCall,
    vetoCouncilContractBalanceCall,
    minerPoolAndGcaContractBalanceCall,
    glowStakedOrLockedBalanceCall,
    earlyLiquidityBalanceCall,
  ]

  const multicall = await publicClient.multicall({
    contracts: calls,
  })

  const results = multicall.map((result, index) => {
    return {
      result: result.result as bigint,
      call: calls[index],
    }
  })

  const [
    totalSupply,
    carbonCreditAuctionBalance,
    grantsContractBalance,
    vetoCouncilContractBalance,
    minerPoolAndGcaContractBalance,
    glowStakedOrLockedBalance,
    earlyLiquidityBalance,
  ] = results

  const circulatingSupply =
    totalSupply.result -
    carbonCreditAuctionBalance.result -
    grantsContractBalance.result -
    vetoCouncilContractBalance.result -
    minerPoolAndGcaContractBalance.result -
    glowStakedOrLockedBalance.result -
    earlyLiquidityBalance.result
  const formattedTotalSupplyMinusRest = Number(
    formatUnits(circulatingSupply, 18)
  )
  const marketCap = formattedTotalSupplyMinusRest * glowPrice
  return {
    circulatingSupply: formattedTotalSupplyMinusRest,
    marketCap,
    carbonCreditAuctionBalance: Number(
      formatUnits(carbonCreditAuctionBalance.result, 18)
    ),
    grantsContractBalance: Number(
      formatUnits(grantsContractBalance.result, 18)
    ),
    vetoCouncilContractBalance: Number(
      formatUnits(vetoCouncilContractBalance.result, 18)
    ),
    minerPoolAndGcaContractBalance: Number(
      formatUnits(minerPoolAndGcaContractBalance.result, 18)
    ),
    glowStakedOrLockedBalance: Number(
      formatUnits(glowStakedOrLockedBalance.result, 18)
    ),
    earlyLiquidityBalance: Number(
      formatUnits(earlyLiquidityBalance.result, 18)
    ),

    totalSupply: Number(formatUnits(totalSupply.result, 18)),
  }
}
