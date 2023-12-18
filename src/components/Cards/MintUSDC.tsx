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

export function MintUSDCCard() {
  const { usdc } = useContracts()
  const { address } = useAccount()
  const [amount, setAmount] = useState<number>()
  const mintGCC = async (amount: BigNumberish) => {
    if (!usdc) return
    if (!address) return
    const tx = await usdc.mint(address, amount)
    await tx.wait()
    return
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mint USDC</CardTitle>
        <CardDescription>
          Enter the amount of USDC you want to mint.
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
            mintGCC(ethers.utils.parseUnits(amount!.toString(), 6))
          }
          className="ml-auto"
        >
          Mint
        </Button>
      </CardFooter>
    </Card>
  )
}
