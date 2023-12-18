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

export function RetireGCCCard() {
  const { gcc } = useContracts()
  const { address } = useAccount()
  const [amount, setAmount] = useState<number>()
  const retireGCC = async (amount: BigNumberish) => {
    if (!gcc) return
    if (!address) return
    const tx = await gcc['commitGCC(uint256,address,uint256)'](
      amount,
      address,
      0
    )
    await tx.wait()
    return
  }

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Commit GCC</CardTitle>
        <CardDescription>
          Enter the amount of tokens you want to retire.
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
          onClick={() => retireGCC(ethers.utils.parseEther(amount!.toString()))}
          className="ml-auto"
        >
          Commit GCC
        </Button>
      </CardFooter>
    </Card>
  )
}
