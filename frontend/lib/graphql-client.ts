import { ApolloClient, InMemoryCache } from "@apollo/client";

export const graphqlClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
  cache: new InMemoryCache()
});