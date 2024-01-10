import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'
//prettier ignore on this page
/** pr */
const createQuery = () => {
  return gql`
    {
      mostPopularProposals(first: 100, orderBy: id, orderDirection: asc) {
        id,
        proposal{
          id,
        }
        isVetoed
      }
    }
  `
}

export type FindMostPopularProposalSubgraphResponse = {
  mostPopularProposals: {
    id: string
    proposal: {
      id: string
      isVetoed: boolean
    }
  }[]
}
export type FindMostPopularProposalIdsResponse =
  FindMostPopularProposalSubgraphResponse & { flatProposalIds: string[] }

export const findMostPopularProposalIds =
  async (): Promise<FindMostPopularProposalIdsResponse> => {
    const query = createQuery()
    const { data } =
      await client.query<FindMostPopularProposalSubgraphResponse>({
        query,
      })
    console.log({ data })
    const flatProposalIds = data.mostPopularProposals.map((proposal) => {
      return proposal.proposal.id
    })
    console.log('flatProposalIds', flatProposalIds)
    const res: FindMostPopularProposalIdsResponse = {
      ...data,
      flatProposalIds,
    }
    return res
  }
