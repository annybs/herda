import './HerdListView.scss'
import ButtonSet from '@/components/ButtonSet'
import Chip from '@/components/Chip'
import CreateButton from '@/components/button/CreateButton'
import FormGroup from '@/components/form/FormGroup'
import FormInput from '@/components/form/FormInput'
import { Link } from 'react-router-dom'
import LoadingIndicator from '@/components/LoadingIndicator'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import Pagination from '@/components/Pagination'
import ResetButton from '@/components/button/ResetButton'
import Row from '@/components/Row'
import SaveButton from '@/components/button/SaveButton'
import SearchForm from '@/components/SearchForm'
import api from '@/api'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useRouteSearch } from '@/hooks'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useSession } from '@/hooks'
import Placeholder from '@/components/Placeholder'
import { CloudIcon } from '@heroicons/react/20/solid'

interface HerdCreateFormData extends Pick<api.Herd, 'name'> {}

function useHerdCreateForm() {
  const form = useForm<HerdCreateFormData>({ mode: 'onBlur' })

  const inputs = {
    name: form.register('name', { validate: value => {
      if (value.length < 1) return 'Required'
    }}),
  }

  return { ...form, inputs }
}

export default function ListHerds() {
  const { account } = useSession()
  const createHerdForm = useHerdCreateForm()
  const navigate = useNavigate()
  const { options } = useConnection()
  const { searchParams } = useRouteSearch()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<api.SearchResponse<api.GetHerdResponse>>()

  async function createHerd(data: HerdCreateFormData) {
    if (busy || !account) return

    try {
      setBusy(true)
      setError(undefined)
      const res = await api.createHerd(options, {
        herd: {
          _account: account._id,
          name: data.name,
        },
      })
      navigate(`/herd/${res.herd._id}`)
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  const reload = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await api.searchHerds(options, searchParams)
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

      {result.metadata.totalCount > 0 ? (
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
      ) : (
        <Placeholder>
          <CloudIcon />
          <span>No herds!</span>
        </Placeholder>
      )}

      <form onSubmit={createHerdForm.handleSubmit(createHerd)}>
        <FormGroup name="Create a new herd">
          <FormInput id="herd:name" label="Name">
            <input id="herd:name" type="text" {...createHerdForm.inputs.name} />
            <Chip className="mini" error={createHerdForm.formState.errors.name} />
          </FormInput>

          <ButtonSet>
            <SaveButton type="submit" className="fill" />
            <ResetButton type="reset" />
          </ButtonSet>
        </FormGroup>
      </form>
    </Main>
  )
}
