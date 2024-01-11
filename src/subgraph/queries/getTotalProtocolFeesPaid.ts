import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'

const createQuery = () => {
  return gql`
    {
      protocolFeeSum(id: "protocol-fee-aggregation") {
        id
        totalProtocolFeesPaid
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
export type GetAllProtocolFeeSubraphResponse = {
  protocolFeeSum: {
    id: string
    totalProtocolFeesPaid: string
  }
}

export const getTotalProtocolFeesPaid =
  async (): Promise<GetAllProtocolFeeSubraphResponse> => {
    const query = createQuery()
    const { data } = await client.query<GetAllProtocolFeeSubraphResponse>({
      query,
    })
    return data
  }
