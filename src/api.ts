/**
 * Standard search result type.
 */
export interface SearchResult<T> {
  results: T[]
  metadata: {
    limit: number
    page: number
    totalCount: number
  }
}
