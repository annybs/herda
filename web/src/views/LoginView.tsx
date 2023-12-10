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
import type { SubmitHandler } from 'react-hook-form'
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

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()

  const inputs = {
    email: form.register('email', { validate: {
      required: value => value.length >= 1 || 'Required',
    }}),
    password: form.register('password', { validate: {
      minLength: value => value.length >= 8 || 'Must be at least 8 characters',
    }}),
  }

  return {
    ...form,
    inputs,
    busy, setBusy,
    error, setError,
  }
}

export default function LoginView() {
  const doc = useDocument()
  const [params] = useSearchParams()
  const session = useSession()

  const { formState: { errors }, ...form } = useLoginForm()

  const [passwordVisible, setPasswordVisible] = useState(false)
  const redirectTo = params.get('redirect') || '/'

  const submit: SubmitHandler<LoginFormData> = async ({ email, password }) => {
    form.setError(undefined)
    form.setBusy(true)
    try {
      await session.login(email, password)
    } catch (err) {
      form.setError(err as Error)
    } finally {
      form.setBusy(false)
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
            <input id="email" type="text" {...form.inputs.email} />
            {errors.email && <Chip className="mini" error={errors.email} />}
          </FormInput>

          <FormInput id="password" label="Password">
            <Row className="hidden">
              <input id="password" type={passwordVisible ? 'text' : 'password'} {...form.inputs.password} />
              <ButtonSet>
                <HideShowButton visible={passwordVisible} onClick={() => setPasswordVisible(!passwordVisible)} />
              </ButtonSet>
            </Row>
            {errors.password && <Chip className="mini" error={errors.password} />}
          </FormInput>

          <ButtonSet>
            <Button className="wide fill positive" disabled={form.busy} type="submit">Log in</Button>
          </ButtonSet>

          <Notice error={form.error} />

          <section className="create-account">
            Don't have an account yet? <Link to="/account/create">Create one</Link>
          </section>
        </FormGroup>
      </form>
    </Main>
  )
}
