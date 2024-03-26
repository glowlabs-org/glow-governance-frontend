import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'

const createQuery = (address: string) => {
  return gql`
    {
      donations(where: { isDonation:true, user: "${address.toLowerCase()}" }) {
        id,
        blockTimestamp,
        transactionHash,
        amount,
        user:{
          id
        }
      }
    }
  `
}

export type DonationsSubgraphResponse = {
  donations: {
    id: string
    blockTimestamp: string
    transactionHash: string
    amount: string
    user: {
      id: string
    }
  }[]
}

export const findDonationsFromAddress = async (
  address: string
): Promise<DonationsSubgraphResponse> => {
  const query = createQuery(address)
  const { data } = await client.query<DonationsSubgraphResponse>({
    query,
  })
  return data
}
