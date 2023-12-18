import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'
import { ProposalType } from '@/types/enums'

type ProposalTypeResponse = {
  proposal: {
    proposalType: ProposalType
  }
}
const getProposalType = async (id: string) => {
  const query = gql`
    {
        proposal(id:${id}) { 
            proposalType
        }
    }
`
  const { data } = await client.query<ProposalTypeResponse>({
    query,
  })
  return data.proposal.proposalType
}

export interface Proposal {
  id: string
  proposer: {
    id: `0x{string}`
  }
  proposalType: ProposalType
  nominationsUsed: {
    nominationsUsed: string
  }
  blockTimestamp: string
  transactionHash: `0x{string}`
}

export interface VetoCouncilElectionOrSlashQueryResponse extends Proposal {
  proposalType: ProposalType.VetoCouncilElectionOrSlash
  oldAgent: {
    id: `0x{string}`
  }
  newAgent: {
    id: `0x{string}`
  }
  slashOldAgent: boolean
}

export interface ChangeGCARequirementsQueryResponse extends Proposal {
  proposalType: ProposalType.ChangeGCARequirements
  hash: `0x{string}`
}

export interface RequestForCommentQueryResponse extends Proposal {
  proposalType: ProposalType.RequestForComment
  hash: `0x{string}`
}

export interface GrantsQueryResponse extends Proposal {
  proposalType: ProposalType.Grants
  hash: `0x{string}`
  amount: string
  recipient: {
    id: `0x{string}`
  }
}
export interface GCAElectionOrSlashQueryResponse extends Proposal {
  proposalType: ProposalType.GCAElectionOrSlash
  newGCAs: {
    id: `0x{string}`
  }[]
  agentsToSlash: {
    id: `0x{string}`
  }[]
}

const createQuery = (id: string, proposalType: ProposalType) => {
  switch (proposalType) {
    case ProposalType.VetoCouncilElectionOrSlash:
      return gql`
            {
                vetoCouncilElectionOrSlashProposal(id:${id}) { 
                    proposalType,
                    proposer{id},
                    nominationsUsed{
                        nominationsUsed
                    },
                    blockTimestamp,
                    transactionHash,
                    oldAgent {id},
                    newAgent {id},
                    slashOldAgent
                }
            }
        `
    case ProposalType.ChangeGCARequirements:
      return gql`
            {
                changeGCARequirementsHashProposal(id:${id}) { 
                    proposalType,
                    proposer{id},
                    nominationsUsed{
                        nominationsUsed
                    },
                    blockTimestamp,
                    transactionHash,
                    hash
                }
            }
        `
    case ProposalType.RequestForComment:
      return gql`
            {
            rfcproposal(id:${id}) {
                proposalType,
                proposer{id},
                nominationsUsed{
                    nominationsUsed
                },
                blockTimestamp,
                transactionHash,
                hash
            }
            }
            `
    case ProposalType.Grants:
      return gql`
            {
            grantsProposal(id:${id}) {
                proposalType,
                proposer{id},
                nominationsUsed{
                    nominationsUsed
                },
                blockTimestamp,
                transactionHash,
                hash,
                amount,
                recipient{id},
            }
            }
            `
    case ProposalType.GCAElectionOrSlash:
      return gql`
            {
                gcaelectionOrSlashProposal(id:${id}) {
                proposalType,
                proposer{id},
                nominationsUsed{
                    nominationsUsed
                },
                blockTimestamp,
                transactionHash,
                newGCAs{id},
                agentsToSlash{id}
            }
            }
            `
    default:
      throw new Error('Invalid Proposal Type')
  }
}

export type ProposalQueryRes = {
  [key: string]:
    | VetoCouncilElectionOrSlashQueryResponse
    | ChangeGCARequirementsQueryResponse
    | RequestForCommentQueryResponse
    | GrantsQueryResponse
    | GCAElectionOrSlashQueryResponse
}
export type GenericProposal =
  | VetoCouncilElectionOrSlashQueryResponse
  | ChangeGCARequirementsQueryResponse
  | RequestForCommentQueryResponse
  | GrantsQueryResponse
  | GCAElectionOrSlashQueryResponse
export const findProposalInfo = async (
  id: string
): Promise<GenericProposal> => {
  const proposalType = await getProposalType(id)
  const query = createQuery(id, proposalType)
  const { data } = await client.query<ProposalQueryRes>({
    query,
  })
  const key = Object.keys(data)[0]
  const res = data[key]
  res.id = id
  return res
}
