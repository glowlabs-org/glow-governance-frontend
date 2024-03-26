import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'

const createQuery = (address: string) => {
  return gql`
    {
  gccretireds(first:100,where:{account:"${address.toLowerCase()}"}) {
    amountGCCRetired,
    usdcEffect
    blockTimestamp,
    impactPower,
    rewardAddress {
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
type IndividualRetirement = {}
export type FindRetirementsByAddressResponse = {
  gccretireds: {
    amountGCCRetired: string
    usdcEffect: string
    blockTimestamp: string
    impactPower: string
    rewardAddress: {
      id: `0x{string}`
    }
  }[]
}

export const findRetirementsByAddress = async (
  address: string
): Promise<FindRetirementsByAddressResponse> => {
  const query = createQuery(address)
  const { data } = await client.query<FindRetirementsByAddressResponse>({
    query,
  })
  return data
}
