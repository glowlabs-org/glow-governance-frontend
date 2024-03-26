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

export function CommitUSDCCard() {
  const { gcc, usdg } = useContracts()
  const { address } = useAccount()
  const [amount, setAmount] = useState<number>()
  const commitUSDC = async (amount: BigNumberish) => {
    if (!gcc) return
    if (!address) return
    if (!usdg) return
    const allowance = await usdg.allowance(address, gcc.address)
    if (allowance.lt(amount)) {
      const tx = await usdg.approve(gcc.address, ethers.constants.MaxUint256)
      await tx.wait()
    }

    const tx = await gcc['commitUSDC(uint256,address,uint256)'](
      amount,
      address,
      0
    )
    await tx.wait()
    return
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Commit USDG</CardTitle>
        <CardDescription>
          Enter the amount of USDG you want to commit. Commiting USDG has no
          financial benefit and is only used to increase your governance power
          by increasing your nominations. Committing USDG or GCC to Glow is like
          donating your money to climate change. You will get good karma, but
          you will not get your tokens back.
        </CardDescription>
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
          onClick={() =>
            commitUSDC(ethers.utils.parseUnits(amount!.toString(), '6'))
          }
          className="ml-auto"
        >
          Commit USDG
        </Button>
      </CardFooter>
    </Card>
  )
}
