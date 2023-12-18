import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContracts } from '@/hooks/useContracts'
import { isAddress } from 'ethers/lib/utils.js'
import { useState } from 'react'
import { Divider } from './Divider'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ethers } from 'ethers'
import { keccak256 } from 'ethers/lib/utils.js'
import { useExpandedState } from '../useExpandedState'
export const RFCSpecificComponent = () => {
  const { governance } = useContracts()
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState<string>('')
  const { setRfcExpanded } = useExpandedState((state) => {
    return { setRfcExpanded: state.setRfcExpanded }
  })

  const [trueForTextFalseForHash, setTrueForTextFalseForHash] =
    useState<boolean>(false)
  const changeGCARequirements = async () => {
    if (!governance) return
    const nominationCost = await governance.costForNewProposal()
    setLoading(true)
    let _requirements = requirements
    if (trueForTextFalseForHash) {
      _requirements = keccak256(ethers.utils.toUtf8Bytes(requirements))
    }
    try {
      const tx = await governance.createRFCProposal(
        _requirements,
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

  const hashOrText = () => {
    return (
      <div className="flex flex-row gap-x-4 items-center">
        <div className="flex flex-row cursor-pointer border-black border-2 rounded-sm">
          <button
            onClick={() => {
              setTrueForTextFalseForHash(false)
              setRfcExpanded(false)
            }}
            className={cn(
              'px-3 py-1 text-sm',
              trueForTextFalseForHash ? 'b' : 'bg-black text-white'
            )}
          >
            {' '}
            Hash
          </button>
          <button
            onClick={() => {
              setTrueForTextFalseForHash(true)
              setRfcExpanded(true)
            }}
            className={cn(
              'px-3 py-1 text-sm',
              !trueForTextFalseForHash ? '' : 'bg-black text-white'
            )}
          >
            Text
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-3">
        {trueForTextFalseForHash ? (
          <Textarea
            onChange={(e) => {
              setRequirements(e.target.value)
            }}
            placeholder="Enter RFC"
          />
        ) : (
          <Input
            onChange={(e) => {
              setRequirements(e.target.value)
            }}
            placeholder="Enter RFC"
          />
        )}
        {hashOrText()}
        {loading ? (
          <Button className="bg-accent-1 mt-6">
            <Loader2 className="animate-spin" size={24} />
            Loading
          </Button>
        ) : (
          <Button
            onClick={() => {
              changeGCARequirements()
            }}
            className="bg-accent-1"
          >
            Execute
          </Button>
        )}
      </div>
    </>
  )
}
