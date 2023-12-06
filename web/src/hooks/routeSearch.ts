import api from '@/api'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useRouteSearch() {
  const [search, setSearch] = useSearchParams()

  function setLimit(limit: number) {
    setSearch(prev => {
      prev.set('limit', limit.toString())
      return prev
    })
  }

  function setPage(page: number) {
    setSearch(prev => {
      prev.set('page', page.toString())
      return prev
    })
  }

  function setSearchTerms(terms: string) {
    setSearch(prev => {
      if (terms.length) prev.set('search', terms)
      else prev.delete('search')
      return prev
    })
  }

  function setSorts(sorts: string[]) {
    setSearch(prev => {
      prev.delete('sort')
      for (const sort of sorts) prev.append('sort', sort)
      return prev
    })
  }

  const { searchParams, searchTerms } = useMemo(() => {
    const searchParams = api.readSearchParams(search)
    if (!searchParams.limit) searchParams.limit = 10
    if (!searchParams.page) searchParams.page = 1

    const searchTerms = search.get('search') || ''
    return { searchParams, searchTerms }
  }, [search])

  const limit = searchParams.limit || 10
  const page = searchParams.page || 1

  const sort = searchParams.sort || []

  return {
    limit, page, searchTerms, sort,
    searchParams, search,

    setLimit,
    setPage,
    setSearch,
    setSearchTerms,
    setSorts,
  }
}
