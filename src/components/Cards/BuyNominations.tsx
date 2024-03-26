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
import { formatUnits, parseUnits } from 'viem'

export function BuyNominationsCard() {
  const [amount, setAmount] = useState<number>()
  const [amountUSDGNeeded, setAmountUSDGNeeded] = useState<string>()
  type ApiRes = {
    estimate: {
      amountUSDCNeededNumber: number
      amountUSDCNeededBigNumber: string
      expectedImpactPointsBigNumber: string
      expectedImpactPointsNumber: number
    }
  }

  async function calculateUSDGNeededToPurchaseNominations() {
    const route =
      process.env.NEXT_PUBLIC_GCA_API_URL +
      '/estimateUSDC?amountImpactPointsDesired=' +
      ethers.utils.parseUnits(amount!.toString(), '12')

    const res = await fetch(route)
    const data = (await res.json()) as ApiRes
    setAmountUSDGNeeded(data.estimate.amountUSDCNeededBigNumber)
  }

  const swap = async (amount: BigNumberish) => {
    const data = await calculateUSDGNeededToPurchaseNominations()
    console.log(data)

    // if (!address) return
    // if (!usdc) return
    // if (!usdg) return
    // const usdcBalance = await usdc.balanceOf(address)
    // if (usdcBalance.lt(amount)) {
    //   alert('You do not have enough USDC to swap')
    //   return
    // }

    // const allowance = await usdc.allowance(address, usdg.address)
    // if (allowance.lt(amount)) {
    //   const tx = await usdc.approve(usdg.address, ethers.constants.MaxUint256)
    //   await tx.wait()
    // }

    // const tx2 = await usdg.swap(address, amount)
    // await tx2.wait()
    // // await tx2.wait()
    return
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buy Impact Power</CardTitle>
        <CardDescription>
          Enter the amount of impact Power to buy
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
        {/* {amountUSDGNeeded && (
          <div className="flex flex-col gap-y-2">
            <p>
              Cost: ${(BigInt(amountUSDGNeeded!) / BigInt(1e6)).toString()} USDG
            </p>
          </div>
        )} */}

        <DialogDemo
          amountUSDGNeeded={amountUSDGNeeded!}
          nominationsAmountToBuy={amount?.toString() || '0'}
          openButtonFunction={calculateUSDGNeededToPurchaseNominations}
        />
      </CardFooter>
    </Card>
  )
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useBalances } from '@/hooks/useBalances'

type DialogProps = {
  amountUSDGNeeded: string | undefined
  openButtonFunction: () => void
  nominationsAmountToBuy: string | undefined
}
export function DialogDemo({
  amountUSDGNeeded,
  openButtonFunction,
  nominationsAmountToBuy,
}: DialogProps) {
  const { usdgBalance, usdcBalance } = useBalances()
  const { gcc, usdg } = useContracts()
  const { address } = useAccount()
  //   alert(amo)

  //   alert(nominationsAmountToBuy)

  //   async func
  const commitUSDC = async () => {
    if (!amountUSDGNeeded) return
    if (!nominationsAmountToBuy) return
    const amount = amountUSDGNeeded
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
      (parseUnits(nominationsAmountToBuy, 12) * BigInt(99)) / BigInt(100)
    )
    await tx.wait()
    return
  }
  const errorText = () => {
    if (parseUnits(usdgBalance, 6) < BigInt(amountUSDGNeeded || 0)) {
      if (parseUnits(usdcBalance, 6) > BigInt(amountUSDGNeeded || 0)) {
        return 'Error: Swap USDG for USDC to purchase these impact power'
      }
      return 'Error: You do not have enough USDG or USDC to purchase these impact power'
    }
    return undefined
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={openButtonFunction} className="ml-auto">
          Buy Impact Power
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Impact Power</DialogTitle>
          <DialogDescription>
            You will need to purchase{' '}
            {formatUnits(BigInt(amountUSDGNeeded || 0), 6)} USDG to purchase{' '}
            {nominationsAmountToBuy} nominations
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col">
            <div className="grid grid-cols-2 w-full ">
              <p className="border-2 text-center border-black">USDG Balance</p>
              <p className="border-2 text-center border-black">{usdgBalance}</p>
            </div>
            <div className="grid grid-cols-2 w-full ">
              <p className="border-2 text-center border-black">USDC Balance</p>
              <p className="border-2 text-center border-black">{usdcBalance}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-row text-sm">
          <p className="text-red-400">{errorText()}</p>
        </div>
        <DialogFooter>
          {errorText() ? (
            <Button disabled={true} type="submit">
              Confirm
            </Button>
          ) : (
            <Button onClick={commitUSDC} type="submit">
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
