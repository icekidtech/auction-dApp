'use client';

import { ApolloProvider, ApolloClient, InMemoryCache, DefaultOptions } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from '@apollo/client/link/http';
import { from } from '@apollo/client/link/core';

// Add error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Add HTTP link with timeouts
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
  fetchOptions: {
    timeout: 30000, // 30 seconds timeout
  }
});

// Default options with better error handling
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
};

// Configure the Apollo Client
const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions,
  connectToDevTools: true,
});

console.log('Apollo client initialized with endpoint:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default ApolloWrapper;