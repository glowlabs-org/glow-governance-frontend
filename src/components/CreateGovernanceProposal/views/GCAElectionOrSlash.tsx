import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContracts } from '@/hooks/useContracts'
import { isAddress } from 'ethers/lib/utils.js'
import { useState } from 'react'
import { Divider } from './Divider'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useEffect } from 'react'
export const GCAElectionOrSlashProposalSpecificComponent = () => {
  const [gcasToSlash, setGcasToSlah] = useState<string[]>([])
  const [newGCAs, setNewGCAs] = useState<string[]>([])
  const { governance } = useContracts()
  const [loading, setLoading] = useState(false)
  const [slashingGCAs, setSlashingGCAs] = useState<boolean>(false)
  const executeFunction = async () => {
    if (!governance) return
    const nominationCost = await governance.costForNewProposal()
    setLoading(true)
    try {
      const tx = await governance.createGCACouncilElectionOrSlashProposal(
        gcasToSlash,
        newGCAs,
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
  const addGCA = (gca: string) => {
    //If already inside, throw error
    if (!isAddress(gca)) {
      alert('Not a valid address')
      return
    }
    const alreadyInside = newGCAs.find((gcaAddr) => gcaAddr === gca)
    if (alreadyInside) {
      alert('GCA already inside')
      return
    }
    setNewGCAs([...newGCAs, gca])
  }
  const removeGCA = (gca: string) => {
    setNewGCAs(newGCAs.filter((gcaAddr) => gcaAddr !== gca))
  }

  const addSlashGCA = (gca: string) => {
    if (!isAddress(gca)) {
      alert('Not a valid address')
      return
    }
    //If already inside, throw error
    const alreadyInside = gcasToSlash.find((gcaAddr) => gcaAddr === gca)
    if (alreadyInside) {
      alert('GCA already inside')
      return
    }
    setGcasToSlah([...gcasToSlash, gca])
  }

  const removeSlashGCA = (gca: string) => {
    setGcasToSlah(gcasToSlash.filter((gcaAddr) => gcaAddr !== gca))
  }

  const clearSlashedGCAs = () => {
    setGcasToSlah([])
  }
  const [currentGCA, setGCA] = useState('0x0')
  const [currentSlashGCA, setSlashGCA] = useState('0x0')

  useEffect(() => {
    if (!slashingGCAs) {
      clearSlashedGCAs()
    }
  }, [slashingGCAs])

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-row gap-x-4">
        <Input
          onChange={(e) => {
            setGCA(e.target.value)
          }}
          placeholder="Enter New GCA"
        />
        <Button
          onClick={() => {
            addGCA(currentGCA)
          }}
        >
          Add
        </Button>
      </div>

      {slashingGCAs && (
        <div className="flex flex-row gap-x-4">
          <Input
            onChange={(e) => {
              setSlashGCA(e.target.value)
            }}
            placeholder="Enter GCA To Slash"
          />
          <Button
            onClick={() => {
              addSlashGCA(currentSlashGCA)
            }}
          >
            Add
          </Button>
        </div>
      )}
      <div className="flex flex-row gap-x-4">
        <Switch
          checked={slashingGCAs}
          onCheckedChange={() => {
            setSlashingGCAs(!slashingGCAs)
          }}
        />
        <p className="text-sm">Do you want to Slash any GCAs?</p>
      </div>
      <div className="flex flex-row gap-x-4 justify-around">
        <div className="flex flex-col gap-y-3">
          <p className="font-bold">New GCAs</p>
          {newGCAs.map((gca) => (
            <div>
              <div className="flex flex-row gap-x-4   px-4">
                <p className="w-48 truncate">{gca}</p>
                <Button
                  onClick={() => {
                    removeGCA(gca)
                  }}
                >
                  Remove
                </Button>
              </div>
              <Divider />
            </div>
          ))}
        </div>

        {slashingGCAs && (
          <div className="flex flex-col gap-y-3">
            <p className="font-bold">GCAs To Slash</p>
            {gcasToSlash.map((gca) => (
              <div>
                <div className="flex flex-row gap-x-4">
                  <p className="w-48 truncate">{gca}</p>
                  <Button
                    onClick={() => {
                      removeSlashGCA(gca)
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <Divider />
              </div>
            ))}
          </div>
        )}
      </div>

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
