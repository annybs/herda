import './CreateAccountView.scss'
import * as validate from '@/lib/validate'
import Button from '@/components/button/Button'
import ButtonSet from '@/components/ButtonSet'
import Chip from '@/components/Chip'
import FormGroup from '@/components/form/FormGroup'
import FormInput from '@/components/form/FormInput'
import HideShowButton from '@/components/button/HideShowButton'
import { Link } from 'react-router-dom'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import Row from '@/components/Row'
import api from '@/api'
import { useForm } from 'react-hook-form'
import { useSession } from '@/hooks'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useConnection, useDocument } from '@/hooks'
import { useEffect, useState } from 'react'

interface AccountCreateFormData {
  email: string
  password: string
}

function useAccountCreateForm() {
  const form = useForm<AccountCreateFormData>({ mode: 'onBlur' })

  const inputs = {
    email: form.register('email', { validate: value => {
      if (!value) return 'Required'
      return validate.email(value)
    }}),
    password: form.register('password', { validate: value => {
      if (!value) return 'Required'
      return validate.password(value)
    }}),
  }

  return { ...form, inputs }
}

export default function CreateAccountView() {
  const doc = useDocument()
  const form = useAccountCreateForm()
  const [params] = useSearchParams()
  const { options } = useConnection()
  const session = useSession()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const redirectTo = params.get('redirect') || '/'

  async function submit(data: AccountCreateFormData) {
    if (busy) return

    setError(undefined)
    setBusy(true)
    try {
      await api.createAccount(options, {
        account: {
          email: data.email,
          password: data.password,
        },
      })
      await session.login(data.email, data.password)
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    doc.setTitle('Create Account')
  }, [doc])

  if (session.ready && session.loggedIn) {
    return (
      <Navigate to={redirectTo} />
    )
  }

  return (
    <Main className="center">
      <form onSubmit={form.handleSubmit(submit)}>
        <FormGroup name="Create Account">
          <FormInput id="email" label="Email address">
            <input id="email" disabled={busy} type="text" {...form.inputs.email} />
            {form.formState.errors.email && <Chip className="mini" error={form.formState.errors.email} />}
          </FormInput>

          <FormInput id="password" label="Password">
            <Row className="hidden">
              <input id="password" disabled={busy} type={passwordVisible ? 'text' : 'password'} {...form.inputs.password} />
              <ButtonSet>
                <HideShowButton disabled={busy} visible={passwordVisible} onClick={() => setPasswordVisible(!passwordVisible)} />
              </ButtonSet>
            </Row>
            {form.formState.errors.password && <Chip className="mini" error={form.formState.errors.password} />}
          </FormInput>

          <ButtonSet>
            <Button disabled={busy} className="wide fill positive" type="submit">Create and log in</Button>
          </ButtonSet>

          <Notice error={error} />

          <section className="create-account">
            Have an account already? <Link to="/login">Log in</Link>
          </section>
        </FormGroup>
      </form>
    </Main>
  )
}
