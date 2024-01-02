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
import { usePayProtocolFee } from '@/hooks/usePayProtocolFee'
export function PayProtocolFee() {
  const { payProtocolFee, loading } = usePayProtocolFee()
  const { address } = useAccount()
  const [amount, setAmount] = useState<number>()

  async function _payProtocolFee() {
    if (!address) return
    const tx = await payProtocolFee(
      ethers.utils.parseUnits(amount!.toString(), '6')
    )
    return
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pay Protocol Fee</CardTitle>
        <CardDescription>Enter the amount of USDG </CardDescription>
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
        <Button onClick={_payProtocolFee} className="ml-auto">
          Pay your protocol fee
        </Button>
      </CardFooter>
    </Card>
  )
}
