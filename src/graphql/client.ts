import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import { tokens } from '@/lib/tokens';

import { authLink, errorLink } from './links';

const HTTP_URL = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:8080/graphql';
const WS_URL = process.env.EXPO_PUBLIC_GRAPHQL_WS_ENDPOINT ?? 'ws://localhost:8080/graphql';

const httpLink = new HttpLink({ uri: HTTP_URL });

// graphql-ws transport — token is sent in connectionParams and re-read on each
// (re)connect so a refreshed token is used after reconnects. Exported so the
// connection monitor can observe socket health and force reconnects.
export const wsClient = createClient({
  url: WS_URL,
  lazy: true,
  retryAttempts: 10,
  keepAlive: 15_000,
  connectionParams: () => {
    const token = tokens.getAccess();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  },
});

const wsLink = new GraphQLWsLink(wsClient);

const isSubscription = ({ query }: { query: Parameters<typeof getMainDefinition>[0] }) => {
  const def = getMainDefinition(query);
  return def.kind === 'OperationDefinition' && def.operation === 'subscription';
};

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    authLink,
    ApolloLink.split(isSubscription, wsLink, httpLink),
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
