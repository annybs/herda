import * as validate from '@/lib/validate'
import BackButton from '@/components/button/BackButton'
import ButtonSet from '@/components/ButtonSet'
import Chip from '@/components/Chip'
import DeleteButton from '@/components/button/DeleteButton'
import FormGroup from '@/components/form/FormGroup'
import FormInput from '@/components/form/FormInput'
import HideShowButton from '@/components/button/HideShowButton'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import ResetButton from '@/components/button/ResetButton'
import Row from '@/components/Row'
import SaveButton from '@/components/button/SaveButton'
import { TrashIcon } from '@heroicons/react/20/solid'
import api from '@/api'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useDocument, useSession } from '@/hooks'

type AccountUpdateFormData = api.UpdateAccountRequest['account']

function useAccountUpdateForm() {
  const form = useForm<AccountUpdateFormData>({ mode: 'onBlur' })

  const inputs = {
    email: form.register('email', { validate: validate.email }),
    password: form.register('password', { validate: value => {
      if (!value) return
      return validate.password(value)
    }}),
  }

  return { ...form, inputs }
}

export default function AccountSettingsView() {
  const doc = useDocument()
  const form = useAccountUpdateForm()
  const navigate = useNavigate()
  const { options } = useConnection()
  const { account, ...session } = useSession()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [success, setSuccess] = useState(false)

  async function deleteAccount() {
    if (busy || !account) return

    try {
      setBusy(true)
      setError(undefined)
      await api.deleteAccount(options)
      session.logout()
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  const reset = useCallback(() => {
    if (!account) return

    form.reset({
      email: account.email,
      password: '',
    })
  }, [account, form])

  async function updateAccount(data: AccountUpdateFormData) {
    if (busy || !account) return

    try {
      setSuccess(false)
      setBusy(true)
      setError(undefined)
      await api.updateAccount(options, account._id, {
        account: {
          email: data.email || undefined,
          password: data.password || undefined,
        },
      })
      await session.heartbeat()
      reset()
      setSuccess(true)
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    doc.setTitle('My account')
  }, [doc])

  return account && (
    <Main>
      <form onSubmit={form.handleSubmit(updateAccount)}>
        <header>
          <h1>My account</h1>

          <ButtonSet>
            <BackButton onClick={() => navigate('/')} />
            <ResetButton disabled={busy || !form.formState.isDirty} onClick={reset} className="outline" />
            <SaveButton disabled={busy || !form.formState.isDirty} type="submit" className="fill" />
          </ButtonSet>
        </header>

        {success && <Notice className="positive">Account updated.</Notice>}

        <Notice error={error} />

        <FormGroup name="Settings">
          <FormInput id="email" label="Email address">
            <input id="email" type="text" {...form.inputs.email} />
            <Chip className="mini" error={form.formState.errors.email} />
          </FormInput>

          <FormInput id="password" label="Password">
            <Row className="hidden">
              <input id="password" type={passwordVisible ? 'text' : 'password'} {...form.inputs.password} />
              <ButtonSet>
                <HideShowButton visible={passwordVisible} onClick={() => setPasswordVisible(!passwordVisible)} />
              </ButtonSet>
            </Row>
            {form.formState.errors.password && <Chip className="mini" error={form.formState.errors.password} />}
          </FormInput>
        </FormGroup>
      </form>

      <h2>Delete account</h2>

      <p>
        If you would like to stop using Herda, you can delete your account and all your data.
        This is not reversible, so proceed with care.
      </p>

      <ButtonSet>
        <DeleteButton
          className="fill"
          confirm={(
            <>
              <TrashIcon />
              <span>Yes, really delete my account!</span>
            </>
          )}
          onClick={deleteAccount}
        >
          <span>Delete my account</span>
        </DeleteButton>
      </ButtonSet>
    </Main>
  )
}
