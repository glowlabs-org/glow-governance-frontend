import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'

const createQuery = () => {
  return gql`
    {
      donations(where: { isDonation: true }) {
        id
        blockTimestamp
        transactionHash
        amount
        user {
          id
        }
      }
    }
  `
}

/*
{
  "data": {
    "gccretireds": [
      {
        "amount": "1000000000000000000",
        "blockTimestamp": "1697553720",
        "rewardAddress": {
          "id": "0x897fe97aefd10a82146fbbdbff534bf1297a1c16"
        }
      }
    ]
  }
}
*/
export type FindAllDonationsSubgraphResponse = {
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

export const findAllDonations =
  async (): Promise<FindAllDonationsSubgraphResponse> => {
    const query = createQuery()
    const { data } = await client.query<FindAllDonationsSubgraphResponse>({
      query,
    })
    return data
  }
