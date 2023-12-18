import { useEffect, useState } from 'react'
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

export function ProposalsTable() {
  const [proposalDashInfo, setProposalDashInfo] =
    useState<ProposalDashResponse>()
  const fetchProposalDashInfo = async () => {
    const res = await findProposalsDash()
    setProposalDashInfo(res)
  }
  useEffect(() => {
    fetchProposalDashInfo()

    return () => {
      setProposalDashInfo(undefined)
    }
  }, [])

  return (
    <Table className="bg-white rounded-lg ">
      <TableCaption>Proposals</TableCaption>
      <TableHeader>
        <TableRow className="px-4">
          <TableHead>Date</TableHead>
          <TableHead>Proposal Type</TableHead>
          <TableHead>Number Of Nominations</TableHead>
          <TableHead>Proposer</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposalDashInfo?.proposals.map((data) => (
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
              {data.proposer.id.slice(0, 6) + data.proposer.id.slice(36, 42)}
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
  )
}
