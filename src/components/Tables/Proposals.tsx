import { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import {
  ProposalDashResponse,
  findProposalsDash,
} from '@/subgraph/queries/proposals'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { ProposalStatus } from '@/types/ProposalStatus'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProposalStatusColors = {
  color: string
  text: string
  description: string
}
const statusColor: Record<ProposalStatus, ProposalStatusColors> = {
  'Open For Nominations': {
    color: `bg-green-500`,
    text: 'text-green-600',
    description:
      'This proposal is open to nominations to be selected for ratification.',
  },
  'Rejected By Glow Stakers': {
    color: `bg-yellow-500`,
    text: 'text-yellow-600',
    description: 'This proposal was rejected by Glow stakers.',
  },
  'Succesfully Executed': {
    color: `bg-green-500`,
    text: 'text-green-600',
    description: 'This proposal was successfully executed.',
  },
  'Unsuccesfully Executed': {
    color: `bg-red-500`,
    text: 'text-red-600',
    description: 'This proposal was unsuccessfully executed.',
  },

  'Open For Ratification': {
    color: `bg-green-500`,
    text: 'text-green-600',
    description: 'This proposal is open for ratification from Glow stakers.',
  },
  Vetoed: {
    color: `bg-gray-500`,
    text: 'text-gray-600',
    description: 'This proposal was vetoed by the Veto Council.',
  },
  Expired: {
    color: `bg-red-500`,
    text: 'text-red-600',
    description: 'This proposal expired.',
  },
  'Awaiting Execution': {
    color: `bg-orange-500`,
    text: 'text-orange-600',
    description: 'This proposal is awaiting execution.',
  },
}

export const StatusLegend = () => {
  const [open, setOpen] = useState(false)

  const toggleOpen = () => {
    setOpen(!open)
  }
  return (
    <div className="flex flex-col gap-4">
      <Button className="w-48 mb-4" onClick={toggleOpen}>
        Toggle Legend
      </Button>
      {open &&
        Object.keys(statusColor).map((status) => (
          <div className="flex flex-row gap-2 items-center  rounded-lg">
            <div
              className={cn(
                'rounded-full flex flex-col px-4 py-2 border w-52',
                statusColor[status as ProposalStatus].color,
                statusColor[status as ProposalStatus].text,
                ` bg-opacity-40`,
                `text-sm`
              )}
            >
              <p>{status}</p>
            </div>
            <p>{statusColor[status as ProposalStatus].description}</p>
          </div>
        ))}
    </div>
  )
}

const StatusButton = ({ status }: { status: ProposalStatus }) => {
  return (
    <button
      className={cn(
        'rounded-full px-4 py-2',
        statusColor[status].color,
        statusColor[status].text,
        ` bg-opacity-40`,
        `text-sm`
      )}
    >
      {status}
    </button>
  )
}
type ProposalFilterText = 'View All' | ProposalStatus
export function ProposalsTable({
  proposalDashInfo,
}: {
  proposalDashInfo: ProposalDashResponse
}) {
  const filters: ProposalStatus[] = [
    'Open For Nominations',
    'Open For Ratification',
    'Rejected By Glow Stakers',
    'Succesfully Executed',
    'Unsuccesfully Executed',
    'Vetoed',
    'Expired',
    'Awaiting Execution',
  ]
  const [selectedFilter, setSelectedFilter] =
    useState<ProposalFilterText>('View All')

  const filteredByStatus = useMemo(() => {
    if (!proposalDashInfo) return []
    const filtered = proposalDashInfo.proposals.filter(
      (proposal) =>
        proposal.status === selectedFilter || selectedFilter === 'View All'
    )
    const sortedByBlockTimestampDesc = filtered.sort((a, b) => {
      return parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)
    })
    return sortedByBlockTimestampDesc
  }, [proposalDashInfo, selectedFilter])

  const FilterButton = () => {
    return (
      <Select
        onValueChange={(value) => {
          setSelectedFilter(value as ProposalFilterText)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={selectedFilter} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filter</SelectLabel>
            <SelectItem value="View All">View All</SelectItem>
            {filters.map((filter) => (
              <SelectItem value={filter}>{filter}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
  // const filteredByStatus = useMemo(() => {
  //   if (!proposalDashInfo) return []
  //   return proposalDashInfo.proposals.filter(
  //     (proposal) =>
  //       proposal.status === 'Open For Nominations' ||
  //       proposal.status === 'Open For Ratification'
  //   )
  // }
  // , [proposalDashInfo])

  return (
    <>
      <div className="mb-3 flex">
        <FilterButton />
      </div>
      <Table className="bg-white rounded-lg ">
        <TableCaption>Proposals</TableCaption>
        <TableHeader>
          <TableRow className="px-4">
            <TableHead>Date</TableHead>
            <TableHead>Proposal Type</TableHead>
            <TableHead>Number Of Nominations</TableHead>
            <TableHead>Proposer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredByStatus.map((data) => (
            <TableRow key={data.id}>
              <TableCell>
                {new Date(parseInt(data.blockTimestamp) * 1000).toDateString()}
              </TableCell>
              <TableCell> {data.proposalType}</TableCell>
              <TableCell>
                {ethers.utils.formatUnits(
                  data.nominationsUsed.nominationsUsed,
                  12
                )}
              </TableCell>
              <TableCell>
                <a
                  className=" text-blue-500"
                  //open in new tab
                  target="_blank"
                  href={`https://etherscan.io/address/${data.proposer.id}`}
                >
                  {data.proposer.id.slice(0, 6) +
                    data.proposer.id.slice(36, 42)}
                </a>
              </TableCell>
              <TableCell>
                <StatusButton status={data.status} />
              </TableCell>
              <TableCell>
                <Button>
                  <a href={`/proposal/${data.id}`}>View</a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
