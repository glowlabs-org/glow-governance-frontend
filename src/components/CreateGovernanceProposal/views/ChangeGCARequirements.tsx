import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContracts } from '@/hooks/useContracts'
import { isAddress } from 'ethers/lib/utils.js'
import { useState } from 'react'
import { Divider } from './Divider'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { keccak256 } from 'ethers/lib/utils.js'
import { ethers } from 'ethers'
import { cn } from '@/lib/utils'
import { useExpandedState } from '../useExpandedState'
export const ChangeGCARequirementsSpecificComponent = () => {
  const { governance } = useContracts()
  const [loading, setLoading] = useState(false)

  const { setIsRequirementsExpanded } = useExpandedState((state) => {
    return { setIsRequirementsExpanded: state.setIsRequirementsExpanded }
  })

  const [trueForTextFalseForHash, setTrueForTextFalseForHash] =
    useState<boolean>(false)
  const [requirements, setRequirements] = useState<string>('')
  const changeGCARequirements = async () => {
    if (!governance) return
    const nominationCost = await governance.costForNewProposal()
    setLoading(true)
    try {
      let _requirements = requirements
      if (trueForTextFalseForHash) {
        _requirements = keccak256(ethers.utils.toUtf8Bytes(requirements))
      }
      const tx = await governance.createChangeGCARequirementsProposal(
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
              setIsRequirementsExpanded(false)
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
              setIsRequirementsExpanded(true)
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
            placeholder="Enter GCA Requirements"
          />
        ) : (
          <Input
            onChange={(e) => {
              setRequirements(e.target.value)
            }}
            placeholder="Enter GCA Requirements"
          />
        )}
        {hashOrText()}
        <div className="" />
        {loading ? (
          <Button className="bg-accent-1">
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
