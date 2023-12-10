import './LoginView.scss'
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
import { useDocument } from '@/hooks'
import { useForm } from 'react-hook-form'
import { useSession } from '@/hooks'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface LoginFormData {
  email: string
  password: string
}

function useLoginForm() {
  const form = useForm<LoginFormData>()

  const inputs = {
    email: form.register('email', { validate: {
      required: value => value.length >= 1 || 'Required',
    }}),
    password: form.register('password', { validate: {
      minLength: value => value.length >= 8 || 'Must be at least 8 characters',
    }}),
  }

  return { ...form, inputs }
}

export default function LoginView() {
  const doc = useDocument()
  const form = useLoginForm()
  const [params] = useSearchParams()
  const session = useSession()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const redirectTo = params.get('redirect') || '/'

  async function submit(data: LoginFormData) {
    if (busy) return

    setError(undefined)
    setBusy(true)
    try {
      await session.login(data.email, data.password)
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    doc.setTitle('Login')
  }, [doc])

  if (session.ready && session.loggedIn) {
    return (
      <Navigate to={redirectTo} />
    )
  }

  return (
    <Main className="center">
      <form onSubmit={form.handleSubmit(submit)}>
        <FormGroup name="Login">
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
            <Button disabled={busy} className="wide fill positive" type="submit">Log in</Button>
          </ButtonSet>

          <Notice error={error} />

          <section className="create-account">
            Don't have an account yet? <Link to="/account/create">Create one</Link>
          </section>
        </FormGroup>
      </form>
    </Main>
  )
}
