'use client';

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

// Configure the Apollo Client
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default ApolloWrapper;