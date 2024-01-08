import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { GenericProposal, Proposal } from '@/subgraph/queries/getProposal'
import { getAddressURL, getTxHashURL } from '@/constants/urls'
import { ethers } from 'ethers'
import { useBalances } from '@/hooks/useBalances'
import { Copy } from 'lucide-react'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useContracts } from '@/hooks/useContracts'
import { IsMostPopoularProposalResponse } from '@/subgraph/queries/isMostPopularProposal'
import { useAccount } from 'wagmi'
type SpendNominationsDialogButtonProps = {
  data: GenericProposal & IsMostPopoularProposalResponse
  className?: string
}

type VetoProposalButtonProps = {
  data: GenericProposal & IsMostPopoularProposalResponse
  className?: string
  showVetoButtonToCouncil?: boolean
}

function between(x: number, min: number, max: number) {
  return x >= min && x <= max
}

const weekStatus = ({
  genesis,
  weekOfMostPopularProposal,
}: {
  genesis: number
  weekOfMostPopularProposal: number
}) => {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  //Week is in progress if the current timestamp is between
  //genesisTimestamp  + (weekOfMostPopularProposal) * 604800
  // and genesisTimestamp  + (weekOfMostPopularProposal + 1) * 604800
  const weekStart = genesis + weekOfMostPopularProposal * SECONDS_IN_A_WEEK
  const weekEnd = genesis + (weekOfMostPopularProposal + 1) * SECONDS_IN_A_WEEK
  const proposalVetoPeriodEnd = weekStart + SECONDS_IN_A_WEEK * 4

  if (between(currentTimestamp, weekStart, weekEnd)) {
    return 'in-progress'
  }
  if (between(currentTimestamp, weekEnd, proposalVetoPeriodEnd)) {
    return 'veto-open'
  }
  if (currentTimestamp > proposalVetoPeriodEnd) {
    return 'ended'
  }
}

const SECONDS_IN_A_WEEK = 604800
const VetoProposalButton = (props: VetoProposalButtonProps) => {
  const [vetoCouncilLoading, setVetoCouncilLoading] = React.useState(false)
  const { governance, genesisTimestamp } = useContracts()
  const weekOfMostPopularProposal = parseInt(
    props.data.mostPopularProposals[0].id
  )

  const vetoProposal = async () => {
    if (
      weekStatus({ genesis: genesisTimestamp, weekOfMostPopularProposal }) !==
      'veto-open'
    )
      return
    if (vetoCouncilLoading) return
    if (!governance) return
    if (!props.data.isMostPopularProposal) return
    setVetoCouncilLoading(true)
    try {
      const weekOfMostPopularProposal = props.data.mostPopularProposals[0].id
      const tx = await governance.vetoProposal(
        weekOfMostPopularProposal,
        props.data.id
      )
      await tx.wait()
    } catch (e) {
    } finally {
      setVetoCouncilLoading(false)
    }
  }
  const { address } = useAccount()
  const { vetoCouncilContract } = useContracts()
  const [isVetoCouncilMember, setIsVetoCouncilMember] = React.useState(false)
  async function fetchIsVetoCouncilMember() {
    if (!address) return
    if (!vetoCouncilContract) return
    const isVetoCouncilMember =
      await vetoCouncilContract.isCouncilMember(address)
    setIsVetoCouncilMember(isVetoCouncilMember)
  }

  useEffect(() => {
    fetchIsVetoCouncilMember()
  }, [address])

  const getButtonText = () => {
    const status = weekStatus({
      genesis: genesisTimestamp,
      weekOfMostPopularProposal: weekOfMostPopularProposal,
    })
    if (status === 'in-progress') {
      return 'Veto Period Not Open'
    }
    if (status === 'veto-open') {
      return 'Veto This Proposal'
    }
    if (status === 'ended') {
      return 'Veto Period Ended'
    }
  }
  return (
    <div className={props.className}>
      {isVetoCouncilMember && props.data.isMostPopularProposal && (
        <Button
          onClick={() => {
            vetoProposal()
          }}
          className=" w-full"
        >
          {vetoCouncilLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            getButtonText()
          )}
        </Button>
      )}
    </div>
  )
}
export function SpendNominationsDialogButton(
  props: SpendNominationsDialogButtonProps
) {
  const [loading, setLoading] = React.useState(false)
  const [vetoCouncilLoading, setVetoCouncilLoading] = React.useState(false)
  const [numNominationsToSpend, setNumNominationsToSpend] = React.useState(0)
  const balances = useBalances()
  const { governance } = useContracts()

  const spendNominations = async () => {
    if (!governance) return
    const nominationsBN = ethers.utils.parseUnits(
      numNominationsToSpend.toString(),
      12
    )
    setLoading(true)
    try {
      const tx = await governance.useNominationsOnProposal(
        props.data.id,
        nominationsBN
      )
      await tx.wait()
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={props.className}>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Spend Nominations'
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Proposal {props.data.id}</DialogTitle>
            <DialogDescription>
              By clicking confirm, you will use your nominations to vote for
              this proposal.
            </DialogDescription>
            <p>
              Your Nominations:{' '}
              {parseFloat(balances?.nominationBalance).toFixed(2)}
            </p>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                disabled={loading}
                onChange={(e) => {
                  setNumNominationsToSpend(parseFloat(e.target.value))
                }}
                type="number"
                value={numNominationsToSpend}
                defaultValue={0}
              />
            </div>
            {/* <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button> */}
          </div>
          <DialogFooter className="sm:justify-start">
            {/* <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose> */}

            <Button
              onClick={() => {
                spendNominations()
              }}
              className=" w-28"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const Divider = () => {
  return <div className="border-t-[1px] border-gray-300 my-2" />
}

type ProposalViewBaseProps = {
  data: GenericProposal & IsMostPopoularProposalResponse
  children?: React.ReactNode
  proposalTypeTitle: string
  showVetoButtonToCouncil?: boolean
}

export const ProposalViewBase = ({
  data,
  children,
  proposalTypeTitle,
  showVetoButtonToCouncil,
}: ProposalViewBaseProps) => {
  const { genesisTimestamp } = useContracts()
  const statusOfWeek = weekStatus({
    genesis: genesisTimestamp,
    weekOfMostPopularProposal: parseInt(data.mostPopularProposals[0].id),
  })

  return (
    <div className="mx-[10vw] max-w-[1600px] mt-12">
      <div className="lg:grid lg:grid-cols-2 items-center justify-center">
        <div>
          <img
            className="  max-w-xl rounded-lg "
            src={'../../globe.png'}
            alt="GCA Requirements"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4 ">
            // {`Proposal Type: ${proposalTypeTitle}`.toUpperCase()}
          </h2>
          {/* <Divider/> */}
          <div className="border px-8 py-6 rounded-lg">
            <p>
              Proposer:
              <a
                className="text-blue-500 hover:text-blue-600"
                href={getAddressURL(data.proposer.id)}
                target="_blank"
                rel="noreferrer"
              >
                {data.proposer.id}
              </a>
            </p>
            <Divider />
            <p>
              Date:{' '}
              {new Date(
                parseInt(data.blockTimestamp) * 1000
              ).toLocaleDateString()}
            </p>
            <Divider />

            <p>
              Nominations Used:{' '}
              {ethers.utils.formatUnits(
                data.nominationsUsed.nominationsUsed,
                12
              )}
            </p>
            <Divider />

            <p>
              Transaction Hash:
              <a
                className="text-blue-500 hover:text-blue-600"
                href={getTxHashURL(data.transactionHash)}
                target="_blank"
                rel="noreferrer"
              >
                {data.transactionHash}
              </a>
            </p>
            <Divider />
            {children}
          </div>

          {!data.isMostPopularProposal &&
            weekStatus({
              genesis: genesisTimestamp,
              weekOfMostPopularProposal: parseInt(
                data.mostPopularProposals[0].id
              ),
            }) === 'in-progress' && (
              <SpendNominationsDialogButton data={data} className="mt-4" />
            )}

          {data.isMostPopularProposal && (
            <Button className="mt-4">
              Most Popular Proposal For Week {data.mostPopularProposals[0].id}
            </Button>
          )}
          {data.isMostPopularProposal && (
            <VetoProposalButton data={data} className="mt-4" />
          )}
        </div>
      </div>
    </div>
  )
}
