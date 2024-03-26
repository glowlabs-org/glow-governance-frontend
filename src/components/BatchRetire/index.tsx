import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useContracts } from '@/hooks/useContracts'
import { BigNumber, ethers } from 'ethers'
import { isAddress } from 'ethers/lib/utils.js'
import { addresses } from '@/constants/addresses'
import { decodeBatchRetire } from '@/utils/decodeBatchRetire'
const REWARD_ADDRESS = '0xD509A9480559337e924C764071009D60aaCA623d' //glow deployer
type AddressAndAmount = {
  address: string
  amount: number
}

const BatchRetire = () => {
  const { gcc, batchRetire } = useContracts()

  const [addressesAndAmounts, setAddressesAndAmounts] = React.useState<
    AddressAndAmount[]
  >([
    {
      address: '',
      amount: 0,
    },
  ])
  async function batchCommit() {
    const abiEncoder = new ethers.utils.AbiCoder()

    const cleanedInputs: [string, BigNumber][] = []
    let sumOfAmounts = BigNumber.from(0)

    for (const a of addressesAndAmounts) {
      if (isAddress(a.address)) {
        cleanedInputs.push([a.address, ethers.utils.parseEther(`${a.amount}`)])
        sumOfAmounts = sumOfAmounts.add(ethers.utils.parseEther(`${a.amount}`))
      }
    }

    //Tuple is (address,uint256)[]
    const encodedInputs = abiEncoder.encode(
      ['tuple(address,uint256)[]'],
      [cleanedInputs]
    )

    if (!gcc) return

    const allowance = await gcc.allowance(
      await gcc.signer.getAddress(),
      addresses.batchCommit
    )
    if (allowance.lt(sumOfAmounts)) {
      const tx = await gcc.approve(addresses.batchCommit, sumOfAmounts)
      await tx.wait()
    }
    if (!batchRetire) return
    //{sumOfAmounts,REWARD_ADDRESS,minImpactPower,encodedInputs}
    const tx = await batchRetire.commitGCC(
      sumOfAmounts,
      REWARD_ADDRESS,
      0,
      encodedInputs
    )
    await tx.wait()
  }
  const exampleBytes =
    '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000897fe97aefd10a82146fbbdbff534bf1297a1c160000000000000000000000000000000000000000000000001bc16d674ec80000000000000000000000000000897fe97aefd10a82146fbbdbff534bf1297a1c1600000000000000000000000000000000000000000000000029a2241af62c0000'
  const exampleDecode = decodeBatchRetire(exampleBytes)
  const addAddressAndAmount = () => {
    setAddressesAndAmounts([...addressesAndAmounts, { address: '', amount: 0 }])
  }

  const removeAddressAndAmount = (index: number) => {
    setAddressesAndAmounts(addressesAndAmounts.filter((_, i) => i !== index))
  }

  const updateAddress = (index: number, address: string) => {
    setAddressesAndAmounts(
      addressesAndAmounts.map((a, i) => (i === index ? { ...a, address } : a))
    )
  }

  const updateAmount = (index: number, amount: number) => {
    setAddressesAndAmounts(
      addressesAndAmounts.map((a, i) => (i === index ? { ...a, amount } : a))
    )
  }

  const pushEmpty = () => {
    setAddressesAndAmounts([...addressesAndAmounts, { address: '', amount: 0 }])
  }

  return (
    <div>
      {/* <Button onClick={addAddressAndAmount}>Add Address and Amount</Button> */}
      {addressesAndAmounts.map((item, index) => (
        <div className="flex flex-row m-1 gap-x-2" key={index}>
          <Input
            className="w-1/2"
            type="text"
            value={item.address}
            onChange={(e) => updateAddress(index, e.target.value)}
            placeholder="Address"
          />
          <Input
            className="w-24"
            type="number"
            value={item.amount}
            onChange={(e) => updateAmount(index, parseInt(e.target.value) || 0)}
            placeholder="Amount"
          />
          <Button onClick={() => removeAddressAndAmount(index)}>Remove</Button>
        </div>
      ))}
      <Button className="mt-4" onClick={pushEmpty}>
        Add Address and Amount
      </Button>

      <div>
        <Button className="mt-4 bg-accent-1 text-black" onClick={batchCommit}>
          Batch Retire
        </Button>
      </div>
    </div>
  )
}

export default BatchRetire
