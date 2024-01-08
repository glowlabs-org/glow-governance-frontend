import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContracts } from '@/hooks/useContracts'
import { isAddress, keccak256 } from 'ethers/lib/utils.js'
import { useState } from 'react'
import { Divider } from './Divider'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { ethers } from 'ethers'
import { Textarea } from '@/components/ui/textarea'
import { API_URL } from '@/constants/api-url'

export const GrantsProposalSpecificComponent = () => {
  const [addressToGrant, setAddressToGrant] = useState('')
  const [amountToGrant, setAmountToGrant] = useState(0)

  const { governance } = useContracts()
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const handleSaveToFile = (text: string, hash: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `grants-proposal-${hash}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSaveInDB = async () => {
    const descriptionHash = keccak256(ethers.utils.toUtf8Bytes(description))
    console.log({ descriptionHash, description })
    const apiPostParams = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hash: descriptionHash,
        text: description,
      }),
    }
    const res = await fetch(API_URL + '/hash/insert', apiPostParams)
    const data = await res.json()
    console.log(data)
    //
  }

  const executeFunction = async () => {
    if (!governance) return
    const nominationCost = await governance.costForNewProposal()
    setLoading(true)
    try {
      const descriptionHash = keccak256(ethers.utils.toUtf8Bytes(description))
      const amount = ethers.utils.parseEther(amountToGrant.toString())
      await handleSaveInDB()
      // alert('here!')
      const tx = await governance.createGrantsProposal(
        addressToGrant,
        amount,
        descriptionHash,
        nominationCost
      )

      await tx.wait()
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
    return
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Input
        onChange={(e) => {
          setAddressToGrant(e.target.value)
        }}
        placeholder="Address To Grant"
      />
      <Input
        type="number"
        placeholder="Amount To Grant"
        onChange={(e) => {
          setAmountToGrant(parseFloat(e.target.value))
        }}
      />

      <Textarea
        placeholder="What will the grant be used for?"
        onChange={(e) => {
          setDescription(e.target.value)
        }}
      />

      {loading ? (
        <Button className="bg-accent-1 mt-6">
          <Loader2 className="animate-spin" size={24} />
          Loading
        </Button>
      ) : (
        <Button
          onClick={() => {
            executeFunction()
          }}
          className="bg-accent-1"
        >
          Execute
        </Button>
      )}
    </div>
  )
}
