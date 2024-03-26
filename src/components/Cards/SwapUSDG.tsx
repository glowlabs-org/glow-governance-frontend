/**
 * v0 by Vercel.
 * @see https://v0.dev/t/khLcZfx6j7n
 */
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BigNumberish, ethers } from 'ethers'
import { useContracts } from '@/hooks/useContracts'
import { useAccount } from 'wagmi'
import { useState } from 'react'

export function SwapUSDGCard() {
  const { usdc, usdg } = useContracts()
  const { address } = useAccount()
  const [amount, setAmount] = useState<number>()
  const swap = async (amount: BigNumberish) => {
    if (!address) return
    if (!usdc) return
    if (!usdg) return
    const usdcBalance = await usdc.balanceOf(address)
    if (usdcBalance.lt(amount)) {
      alert('You do not have enough USDC to swap')
      return
    }

    const allowance = await usdc.allowance(address, usdg.address)
    if (allowance.lt(amount)) {
      const tx = await usdc.approve(usdg.address, ethers.constants.MaxUint256)
      await tx.wait()
    }

    const tx2 = await usdg.swap(address, amount)
    await tx2.wait()
    // await tx2.wait()
    return
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Swap USDC For USDG</CardTitle>
        <CardDescription>Enter the amount of USDC to swap</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            placeholder="Enter amount"
            type="number"
            onChange={(e) => setAmount(parseFloat(e.target.value))}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => swap(ethers.utils.parseUnits(amount!.toString(), '6'))}
          className="ml-auto"
        >
          Swap USDC for USDG
        </Button>
      </CardFooter>
    </Card>
  )
}
