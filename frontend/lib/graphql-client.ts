import { ApolloClient, InMemoryCache } from "@apollo/client";

export const graphqlClient = new ApolloClient({
  uri: '/api/subgraph',
  cache: new InMemoryCache()
});