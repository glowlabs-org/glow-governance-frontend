import React, { useEffect } from 'react'
import { useContracts } from '@/hooks/useContracts'
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

const Early = () => {
  const { earlyLiquidity, usdg } = useContracts()
  const [totalSold, setTotalSold] = React.useState<number>()
  const [totalRaised, setTotalRaised] = React.useState<number>()
  const [totalUSDGSupply, setTotalUSDGSupply] = React.useState<number>()

  useEffect(() => {
    const getTotalSold = async () => {
      if (!earlyLiquidity) return
      if (!usdg) return
      const totalSold = await earlyLiquidity.totalSold()
      const totalSoldString = totalSold.toString()
      const totalSoldNumber = parseFloat(formatEther(totalSoldString))
      const totalUSDGSupply = await usdg.totalSupply()
      const totalUSDGSupplyString = totalUSDGSupply.toString()
      const totalUSDGSupplyNumber = parseFloat(
        formatUnits(totalUSDGSupplyString, 6)
      )
      setTotalUSDGSupply(totalUSDGSupplyNumber)
      setTotalSold(totalSoldNumber)
      // Example usage
      let firstTerm = 0.3 // First term of the series
      let commonRatio = 1.0000006931474208 // Common ratio
      const seriesSum = computeGeometricSeries(
        firstTerm,
        commonRatio,
        totalSoldNumber
      )
      setTotalRaised(seriesSum)

      /**
       * @dev Events were put here to double check if the javascript impl matched the solidity one
       * @dev The results are that they are EXTREMELY close. The javascript impl is off by less than .0001%
       */
      //   const events = await earlyLiquidity.queryFilter("Purchase",
      //   18809233,"latest")
      //   const filter = earlyLiquidity.filters.Purchase()
      //   const events = await earlyLiquidity.queryFilter(
      //     filter,
      //     18809233,
      //     'latest'
      //   )
      //   console.log(events)
      //   let bn: BigNumber = BigNumber.from(0)
      //   for (const event of events) {
      //     bn = bn.add(event.args.totalUSDCSpent)
      //   }
      //   let bnStr = bn.toString()
      //   let humanReadableUSDC = formatUnits(bnStr, 6)
      //   console.log({ humanReadableUSDC })
    }
    getTotalSold()
  }, [earlyLiquidity])

  function formula(terms: number) {
    //Copilot off
    return 0.3 * 2 ** (terms / 1_000_000)
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
      (firstTerm * (1 - Math.pow(commonRatio, numberOfTerms))) /
      (1 - commonRatio)
    return sum
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
    </main>
  )
}

export default Early
