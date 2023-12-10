import BackButton from '@/components/button/BackButton'
import ButtonSet from '@/components/ButtonSet'
import Chip from '@/components/Chip'
import DeleteButton from '@/components/button/DeleteButton'
import FormGroup from '@/components/form/FormGroup'
import FormInput from '@/components/form/FormInput'
import LoadingIndicator from '@/components/LoadingIndicator'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import Placeholder from '@/components/Placeholder'
import ResetButton from '@/components/button/ResetButton'
import SaveButton from '@/components/button/SaveButton'
import api from '@/api'
import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useDocument } from '@/hooks'
import { useNavigate, useParams } from 'react-router-dom'

interface HerdUpdateFormData extends Pick<api.Herd, 'name'> {}

function useHerdUpdateForm() {
  const form = useForm<HerdUpdateFormData>({ mode: 'onBlur' })

  const inputs = {
    name: form.register('name', { validate: value => {
      if (value.length < 1) return 'Required'
    }}),
  }

  return { ...form, inputs }
}

export default function HerdEditView() {
  const doc = useDocument()
  const { id } = useParams()
  const navigate = useNavigate()
  const { options } = useConnection()
  const updateHerdForm = useHerdUpdateForm()

  const [data, setData] = useState<api.GetHerdResponse>()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function deleteHerd() {
    if (busy || !data) return

    try {
      setBusy(true)
      setError(undefined)
      await api.deleteHerd(options, data.herd._id)
      navigate('/')
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  const reload = useCallback(async () => {
    if (id) {
      setError(undefined)
      setLoading(true)
      try {
        const res = await api.getHerd(options, id)
        setData(res)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
  }, [id, options])

  const reset = useCallback(() => {
    if (data) updateHerdForm.reset({
      name: data?.herd.name,
    })
    else updateHerdForm.reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  async function submit(data: HerdUpdateFormData) {
    console.log(busy)
    if (busy) return

    try {
      setSuccess(false)
      setBusy(true)
      setError(undefined)
      const res = await api.updateHerd(options, id as string, {
        herd: data,
      })
      setData(res)
      setSuccess(true)
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (data?.herd) doc.setTitle(`Editing - ${data.herd.name}`)
    else if (loading) doc.setTitle('Loading herd...')
    else doc.clearTitle()
  }, [data, doc, loading])

  return (
    <Main>
      <form onSubmit={updateHerdForm.handleSubmit(submit)}>
        <header>
          <h1>{data?.herd.name || 'Loading herd...'}</h1>

          <ButtonSet>
            <BackButton onClick={() => navigate(data ? `/herd/${data.herd._id}` : '/')} />
            {data && (
              <>
                <ResetButton disabled={busy || !updateHerdForm.formState.isDirty} onClick={reset} className="outline" />
                <SaveButton disabled={busy || !updateHerdForm.formState.isDirty} type="submit" className="fill" />
                <DeleteButton disabled={busy || updateHerdForm.formState.isDirty} onClick={deleteHerd} />
              </>
            )}
          </ButtonSet>
        </header>

        {loading && (
          <Placeholder>
            <LoadingIndicator />
          </Placeholder>
        )}

        <Notice error={error} />

        {success && <Notice className="positive">Herd updated.</Notice>}

        {data && (
          <FormGroup name="Settings">
            <FormInput id="name" label="Name">
              <input id="name" disabled={busy} type="text" {...updateHerdForm.inputs.name} />
              <Chip className="mini" error={updateHerdForm.formState.errors.name} />
            </FormInput>
          </FormGroup>
        )}
      </form>
    </Main>
  )
}
