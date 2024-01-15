import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'
import { ProposalType } from '@/types/enums'
import { ProposalStatus } from '@/types/ProposalStatus'
import { findMostPopularProposalIds } from './findMostPopularProposalIds'
import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'
import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'wagmi'
import { addresses } from '@/constants/addresses'
// import viem
const createQuery = () => {
  return gql`
    {
      proposals {
        proposer {
          id
        }
        id
        proposalType
        nominationsUsed {
          nominationsUsed
        }
        blockTimestamp
      }
    }
  `
}

export type ProposalDashSubgraphResponse = {
  proposals: {
    proposer: {
      id: `0x{string}`
    }
    id: string
    proposalType: ProposalType
    nominationsUsed: {
      nominationsUsed: string
    }
    blockTimestamp: string
  }[]
}

export type ProposalDashResponse = {
  proposals: {
    proposer: {
      id: `0x${string}`
    }
    id: string
    proposalType: ProposalType
    nominationsUsed: {
      nominationsUsed: string
    }
    blockTimestamp: string
    status: ProposalStatus
  }[]
}
export const findProposalsDash = async (): Promise<ProposalDashResponse> => {
  const query = createQuery()
  const { data } = await client.query<ProposalDashSubgraphResponse>({
    query,
  })
  const { mostPopularProposals, flatProposalIds } =
    await findMostPopularProposalIds()

  const allStatuses = await getAllProposalStatuses()
  /**
   * The proposal is open for nominations if it's not expired and it's not vetoed
   */
  const fullArray: ProposalDashResponse = { proposals: [] }
  for (let i = 0; i < data.proposals.length; i++) {
    const proposal = data.proposals[i]
    let status: ProposalStatus = 'Open For Nominations'
    const isMostPopularProposal = flatProposalIds.includes(proposal.id)
    if (isMostPopularProposal) {
      const isVetoed = mostPopularProposals.find(
        (p) => p.proposal.id === proposal.id
      )?.proposal.isVetoed
      if (isVetoed) {
        status = 'Vetoed'
      }

      if (needsRatification(proposal.proposalType)) {
        status = 'Open For Ratification'
      }
      const proposalTimestamp = parseInt(proposal.blockTimestamp)
      //TODO: Check on-chain if the proposal has been executed

      // It's the week end of the week that it got submitted in + 1
      const weekOfSubmissionForProposal = Math.floor(
        (proposalTimestamp - GENESIS_TIMESTAMP) / 604800
      )
      // const
      // console.log('weekOfSubmissionForProposal', weekOfSubmissionForProposal)
      const currentWeek = Math.floor(
        (Date.now() / 1000 - GENESIS_TIMESTAMP) / 604800
      )
      const weekOfProposalExecution = weekOfSubmissionForProposal + 5
      // console.log({ weekOfProposalExecution })

      if (currentWeek >= weekOfProposalExecution) {
        const onchainStatus = allStatuses.find(
          (s) => s.proposalId === Number(proposal.id)
        )?.onchainStatus
        if (onchainStatus === 'EXECUTED SUCCESFULLY') {
          status = 'Succesfully Executed'
        } else if (onchainStatus === 'EXECUTED WITH ERRROR') {
          status = 'Unsuccesfully Executed'
        } else if (onchainStatus === 'VETOED') {
          status = 'Vetoed'
        } else if (onchainStatus === 'NONE') {
          status = 'Awaiting Execution'
        }
      }

      fullArray.proposals.push({
        ...proposal,
        status,
      })

      continue
    }
    if (!isMostPopularProposal) {
      //If it's been 16 weeks in seconds since block time stamp, it's expired
      const isExpired =
        parseInt(proposal.blockTimestamp) + 7 * 86400 * 16 < Date.now() / 1000
      if (isExpired) {
        status = 'Expired'
        fullArray.proposals.push({
          ...proposal,
          status,
        })
        continue
      }
    }

    //
  }

  //sort by block timestamp descending
  fullArray.proposals.sort((a, b) => {
    return parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)
  })
  return fullArray
}

const needsRatification = (proposalType: ProposalType): boolean => {
  return (
    proposalType === ProposalType.GCAElectionOrSlash ||
    proposalType === ProposalType.ChangeGCARequirements ||
    proposalType === ProposalType.VetoCouncilElectionOrSlash
  )
}

const transport = http('https://eth.merkle.io')
const viemClient = createPublicClient({
  chain: mainnet,
  transport: transport,
})

async function getAllProposalStatuses(): Promise<GetAllStatusesResponse> {
  const abi = parseAbi([
    'function getProposalStatus(uint256) external view returns(uint8)',
    'function proposalCount() external view returns(uint256)',
  ])
  const contract = {
    address: addresses.governance,
    abi: abi,
  } as const
  const numProposals = (await viemClient.readContract({
    abi: abi,
    address: addresses.governance,
    functionName: 'proposalCount',
  })) as BigInt
  //Proposals start at 1
  const allProposalIds: number[] = []
  const numProposalsNumber = Number(numProposals.toString())
  for (let i = 1; i <= numProposalsNumber; i++) {
    allProposalIds.push(i)
  }

  const allProposalStatusCalls = allProposalIds.map((id) => {
    return {
      ...contract,
      functionName: 'getProposalStatus',
      args: [BigInt(id)],
    }
  })
  const multicallResponse = await viemClient.multicall({
    contracts: allProposalStatusCalls,
  })

  const statuses: ProposalOnchainStatus[] = multicallResponse.map(
    (response) => {
      const res: number = response.result as number
      if (res === 0) {
        return 'NONE'
      }
      if (res === 1) {
        return 'EXECUTED SUCCESFULLY'
      }
      if (res === 2) {
        return 'EXECUTED WITH ERRROR'
      }
      if (res === 3) {
        return 'VETOED'
      }
      return 'NONE'
    }
  )
  const allStatuses = allProposalIds.map((id, index) => {
    return {
      proposalId: id,
      onchainStatus: statuses[index],
    }
  })
  return allStatuses
}

type ProposalOnchainStatus =
  | 'NONE'
  | 'EXECUTED SUCCESFULLY'
  | 'EXECUTED WITH ERRROR'
  | 'VETOED'

type GetAllStatusesResponse = {
  proposalId: number
  onchainStatus: ProposalOnchainStatus
}[]
