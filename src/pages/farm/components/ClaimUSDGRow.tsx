'use client'
import React, { useEffect, useState } from 'react'
import { useContracts } from '@/hooks/useContracts'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useAccount } from 'wagmi'
import { HoldingStructOutput } from '@/typechain-types/src/HoldingContract.sol/HoldingContract'
import { Button } from '@/components/ui/button'
const ClaimUSDGRow = () => {
  const { holdingContract, usdg } = useContracts()
  const { address } = useAccount()
  const [holding, setHolding] = useState<HoldingStructOutput>()

  const fetchParams = async () => {
    if (!holdingContract) return
    if (!usdg) return
    if (!address) return
    const holding = await holdingContract.holdings(address, usdg.address)
    setHolding(holding)
  }

  const isClaimable = () => {
    if (!holding) return false
    const isHoldingClaimable =
      holding.expirationTimestamp.toNumber() > Date.now()
    const isAmountGT0 = holding.amount.gt(BigNumber.from(0))
    return isHoldingClaimable && isAmountGT0
  }

  const claim = async () => {
    if (!holdingContract) return
    if (!usdg) return
    if (!address) return
    if (!isClaimable()) {
      alert('Not claimable')
    }
    const tx = await holdingContract.claimHoldingSingleton(
      address,
      usdg.address
    )
    await tx.wait()
    fetchParams()
  }

  useEffect(() => {
    fetchParams()
  }, [holdingContract])

  if (holding?.amount.eq(BigNumber.from(0))) {
    return <div>No UDSG Claimed or In Locker</div>
  }

  return (
    <div>
      {holding && (
        <div>
          <div>
            <div>
              <span>Claimable USDG:</span>
              <span className="ml-2">${formatUnits(holding.amount, 6)}</span>
            </div>
            <div>
              <span>Release Timestamp</span>
              <span className="ml-3">
                {new Date(
                  holding.expirationTimestamp.toNumber() * 1000
                ).toLocaleString()}
              </span>
            </div>
            <Button disabled={!isClaimable()} onClick={claim}>
              {isClaimable() ? 'Claim USDG' : 'USDG Not Claimable'}
            </Button>
          </div>
          {isClaimable() && (
            <p className="bg-red-200 border border-red-500 text-red-500 mt-4 py-4 px-2  rounded-lg">
              Warning: Claiming from a bucket that has USDG rewards will delay
              your ability to claim from your USDG locker for 1 week.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ClaimUSDGRow
