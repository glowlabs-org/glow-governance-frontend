import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'
const createQuery = (id: string) => {
  return gql`
{
 mostPopularProposals(first:10, where:{proposal_:{id:"${id}" }}) {
  id,
  proposal{
    id
  }
}
}
  `
}

/**
 * {
  "data": {
    "mostPopularProposals": [
      {
        "id": "0",
        "proposal": {
          "id": "2"
        }
      }
    ]
  }
}
 */

export type IsMostPopularProposalSubgraphResponse = {
  mostPopularProposals: {
    id: string
    proposal: {
      id: string
    }
  }[]
}

export type IsMostPopoularProposalResponse =
  IsMostPopularProposalSubgraphResponse & { isMostPopularProposal: boolean }
export const isMostPopularProposal = async (
  id: string
): Promise<IsMostPopoularProposalResponse> => {
  const query = createQuery(id)
  const { data } = await client.query<IsMostPopoularProposalResponse>({
    query,
  })
  const isMostPopularProposal = data.mostPopularProposals.length > 0

  const res = {
    ...data,
    isMostPopularProposal,
  }
  return res
}
