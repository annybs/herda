import './HerdListView.scss'
import ButtonSet from '@/components/ButtonSet'
import CreateButton from '@/components/button/CreateButton'
import { Link } from 'react-router-dom'
import LoadingIndicator from '@/components/LoadingIndicator'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import Pagination from '@/components/Pagination'
import Row from '@/components/Row'
import SearchForm from '@/components/SearchForm'
import api from '@/api'
import { useConnection } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import { useRouteSearch } from '@/hooks'
import { useCallback, useEffect, useState } from 'react'

export default function ListHerds() {
  const navigate = useNavigate()
  const { options } = useConnection()
  const { searchParams } = useRouteSearch()

  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<api.SearchResponse<api.GetHerdResponse>>()

  const reload = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await api.searchHerds(options, searchParams)
      if (res.results.length === 0) throw new Error('No herds')
      setResult(res)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [options, searchParams])

  useEffect(() => {
    reload()
  }, [reload])

  function Header() {
    return (
      <header>
        <h1>Herds</h1>
        <ButtonSet>
          <CreateButton className="fill" onClick={() => navigate('/herds/create')} />
        </ButtonSet>
      </header>
    )
  }

  return result && (
    <Main>
      <Header />

      <SearchForm />

      {loading ? (
        <LoadingIndicator />
      ) : (
        <Notice error={error} />
      )}

      {result && (
        <>
          {result.results.map(({ herd }) => (
            <Row key={herd._id} className="herd">
              <div>
                <Link to={`/herd/${herd._id}`}>{herd.name}</Link>
              </div>
            </Row>
          ))}

          <Pagination totalCount={result.metadata.totalCount} />
        </>
      )}
    </Main>
  )
}
