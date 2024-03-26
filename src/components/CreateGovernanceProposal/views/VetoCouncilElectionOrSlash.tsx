import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContracts } from '@/hooks/useContracts'
import { isAddress } from 'ethers/lib/utils.js'
import { useState } from 'react'
import { Divider } from './Divider'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export const VetoCouncilElectionSpecificComponent = () => {
  const [oldAgent, setOldAgent] = useState<string>('')
  const [newAgent, setNewAgent] = useState<string>('')
  const [slashOldAgent, setSlashOldAgent] = useState<boolean>(false)
  const handleSetNewAgent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAddress(e.target.value)) {
      alert('Not a valid address')
      return
    }
    setNewAgent(e.target.value)
  }
  const handleSetOldAgent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAddress(e.target.value)) {
      alert('Not a valid address')
      return
    }
    setOldAgent(e.target.value)
  }

  const { governance } = useContracts()
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState<string>('')
  const executeVetoCouncilAction = async () => {
    if (!governance) return
    const nominationCost = await governance.costForNewProposal()
    setLoading(true)
    try {
      const tx = await governance.createVetoCouncilElectionOrSlash(
        oldAgent,
        newAgent,
        slashOldAgent,
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
    <>
      <div className="flex flex-col gap-y-3">
        <Input onChange={handleSetOldAgent} placeholder="Enter Old Agent" />
        <Input onChange={handleSetNewAgent} placeholder="Enter New Agent" />
        <div className="flex flex-row gap-x-2">
          <Switch
            checked={slashOldAgent}
            onCheckedChange={() => {
              setSlashOldAgent(!slashOldAgent)
            }}
          />
          <p className="text-sm">Slash Old Agent</p>
        </div>

        {loading ? (
          <Button className="bg-accent-1 mt-6">
            <Loader2 className="animate-spin" size={24} />
            Loading
          </Button>
        ) : (
          <Button
            onClick={() => {
              executeVetoCouncilAction()
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
