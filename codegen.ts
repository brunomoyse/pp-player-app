import type { CodegenConfig } from '@graphql-codegen/cli';

// Typed-hook generation from the .gql operations. Requires pp-service running
// (schema introspection) and the codegen toolchain installed:
//   npm i -D @graphql-codegen/cli @graphql-codegen/typescript \
//     @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
//   npx graphql-codegen
//
// Until then, operations are hand-authored as TypedDocumentNodes under
// src/graphql/operations/ (type-safe, no backend dependency for builds).
const config: CodegenConfig = {
  schema: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:8080/graphql',
  documents: ['src/graphql/**/*.gql'],
  generates: {
    'src/graphql/generated/index.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        reactApolloVersion: 4,
        withHooks: true,
        enumsAsTypes: true,
        scalars: { DateTime: 'string', UUID: 'string' },
      },
    },
  },
};

export default config;
