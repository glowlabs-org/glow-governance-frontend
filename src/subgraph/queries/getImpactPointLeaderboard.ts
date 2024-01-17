import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'

const createQuery = () => {
  return gql`
    {
      users(
        orderBy: totalImpactPoints
        orderDirection: desc
        where: { totalImpactPoints_gt: 0 }
      ) {
        id
        totalImpactPoints
      }
    }
  `
}

export type GetImpactPointsLeaderboardSubgraphResponse = {
  users: {
    id: string
    totalImpactPoints: string
  }[]
}

export const getImpactPointsLeaderboard =
  async (): Promise<GetImpactPointsLeaderboardSubgraphResponse> => {
    const query = createQuery()
    const { data } =
      await client.query<GetImpactPointsLeaderboardSubgraphResponse>({
        query,
      })
    return data
  }
