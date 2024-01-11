import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'

const createQuery = (address: string) => {
  return gql`
    {
      donations(where: { isDonation:true, user: "${address.toLowerCase()}" }) {
        id
        blockTimestamp
        transactionHash
        amount
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
export type DonationsSubgraphResponse = {
  donations: {
    id: string
    blockTimestamp: string
    transactionHash: string
    amount: string
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
