import * as dotenv from 'dotenv'
dotenv.config()

const { NEXT_PUBLIC_SUBGRAPH_URL } = process.env
if (!NEXT_PUBLIC_SUBGRAPH_URL) {
  throw new Error('NEXT_PUBLIC_SUBGRAPH_URL is not set')
}
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
export const client = new ApolloClient({
  uri: NEXT_PUBLIC_SUBGRAPH_URL,
  //https://api.studio.thegraph.com/query/38401/glow-subgraph-testnet/v0.0.16
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
})
