// GraphQL Types and Interfaces

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: GraphQLError[]
}

export interface GraphQLError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: Array<string | number>
  extensions?: Record<string, any>
}

export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

export interface GraphQLClientOptions {
  endpoint: string
  headers?: Record<string, string>
  cache?: boolean
  timeout?: number
}

export interface UseGraphQLOptions {
  cache?: boolean
  immediate?: boolean
  timeout?: number
  retry?: number
  retryDelay?: number
}

export interface GraphQLQueryResult<T = any> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<GraphQLError[] | null>
  refetch: () => Promise<void>
  refresh: () => Promise<void>
}

export interface GraphQLMutationResult<T = any> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<GraphQLError[] | null>
  mutate: (variables?: Record<string, any>) => Promise<T | null>
}
