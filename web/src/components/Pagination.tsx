import './Pagination.scss'
import Button from './button/Button'
import ButtonSet from './ButtonSet'
import LimitButton from './button/LimitButton'
import type { PropsWithChildren } from 'react'
import { useRouteSearch } from '@/hooks'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'

export interface PaginationProps {
  totalCount: number
}

export default function Pagination({ totalCount }: PropsWithChildren<PaginationProps>) {
  const { limit, page, ...routeSearch } = useRouteSearch()

  const maxPage = Math.ceil(totalCount / limit)

  const can = {
    first: page > 1,
    previous: page > 1,
    next: page < maxPage,
    last: page < maxPage,
  }

  return (
    <section className="pagination">
      <ButtonSet>
        <Button disabled={!can.first} onClick={() => routeSearch.setPage(1)}>
          <ArrowLeftIcon />
          <span>First</span>
        </Button>
        <Button disabled={!can.previous} onClick={() => routeSearch.setPage(page - 1)}>
          <ArrowLeftIcon />
          <span>Previous</span>
        </Button>
        <span className="info">
          <span>Page {page} of {maxPage}</span>
          <LimitButton className="mini" />
        </span>
        <Button disabled={!can.next} onClick={() => routeSearch.setPage(page + 1)}>
          <ArrowRightIcon />
          <span>Next</span>
        </Button>
        <Button disabled={!can.last} onClick={() => routeSearch.setPage(maxPage)}>
          <ArrowRightIcon />
          <span>Last</span>
        </Button>
      </ButtonSet>
    </section>
  )
}
