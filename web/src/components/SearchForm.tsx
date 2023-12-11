import './SearchForm.scss'
import Button from './button/Button'
import ButtonSet from './ButtonSet'
import FormGroup from './form/FormGroup'
import FormInput from './form/FormInput'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import Row from './Row'
import { useRouteSearch } from '@/hooks'
import { useState } from 'react'
import type { FormEvent, PropsWithChildren } from 'react'

export default function SearchForm({ children }: PropsWithChildren) {
  const { searchTerms, setSearchTerms } = useRouteSearch()

  const [searchInput, setSearchInput] = useState(searchTerms)

  function submit(e: FormEvent) {
    e.preventDefault()
    setSearchTerms(searchInput)
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <FormGroup className="search-bar">
        <FormInput>
          <Row>
            <input
              type="text"
              placeholder="Search terms"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <ButtonSet>
              <Button type="submit">
                <MagnifyingGlassIcon />
                <span>Search</span>
              </Button>
            </ButtonSet>
          </Row>
        </FormInput>
        {children}
      </FormGroup>
    </form>
  )
}
