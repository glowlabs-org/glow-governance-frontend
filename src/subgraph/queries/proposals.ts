import { client } from '@/subgraph/client'
import { gql } from '@apollo/client'
import { ProposalType } from '@/types/enums'
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

/*
 "proposals": [
      {
        "proposer": {
          "id": "0x897fe97aefd10a82146fbbdbff534bf1297a1c16"
        },
        "id": "1",
        "proposalType": "ChangeGCARequirements",
        "nominationsUsed": {
          "nominationsUsed": "1000000"
        },
        "blockTimestamp": "1699259316"
      },
      {
        "proposer": {
          "id": "0x897fe97aefd10a82146fbbdbff534bf1297a1c16"
        },
        "id": "2",
        "proposalType": "VetoCouncilElectionOrSlash",
        "nominationsUsed": {
          "nominationsUsed": "1100000"
        },
        "blockTimestamp": "1699259316"
      }
    ]
  }
}
*/

export type ProposalDashResponse = {
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

export const findProposalsDash = async (): Promise<ProposalDashResponse> => {
  const query = createQuery()
  const { data } = await client.query<ProposalDashResponse>({
    query,
  })
  return data
}
