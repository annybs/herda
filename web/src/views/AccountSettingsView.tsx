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
import { CloudIcon, InboxIcon, TrashIcon } from '@heroicons/react/20/solid'
import HideShowButton from '@/components/button/HideShowButton'
import Button from '@/components/button/Button'
import DeleteButton from '@/components/button/DeleteButton'

interface AccountUpdateFormData extends Pick<api.Account, 'email' | 'password'> {}

function useHerdCreateForm() {
  const form = useForm<AccountUpdateFormData>({ mode: 'onBlur' })

  const inputs = {
    email: form.register('email', { validate: {
      required: value => value.length >= 1 || 'Required',
    }}),
    password: form.register('password', { validate: value => {
      if (!value) return
      if (value.length < 8) return 'Must be at least 8 characters'
    }}),
  }

  return { ...form, inputs }
}

export default function AccountSettingsView() {
  const { account, ...session } = useSession()
  const updateAccountForm = useHerdCreateForm()
  const navigate = useNavigate()
  const { options } = useConnection()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [passwordVisible, setPasswordVisible] = useState(false)

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

  function resetAccountUpdate() {
    if (!account) return

    updateAccountForm.reset({
      email: account.email,
      password: '',
    })
  }

  async function updateAccount(data: AccountUpdateFormData) {
    if (busy || !account) return

    try {
      setBusy(true)
      setError(undefined)
      await api.updateAccount(options, account._id, {
        account: {
          email: data.email || undefined,
          password: data.password || undefined,
        },
      })
      await session.heartbeat()
      resetAccountUpdate()
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    resetAccountUpdate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return account && (
    <Main>
      <header>
        <h1>Your account</h1>

        <ButtonSet>
          <Button className="fill" onClick={() => navigate('/')}>
            <InboxIcon />
            <span>Back to Herds</span>
          </Button>
        </ButtonSet>
      </header>

      <Notice error={error} />

      <form onSubmit={updateAccountForm.handleSubmit(updateAccount)}>
        <FormGroup name="Settings">
          <p>You can update your login details below.</p>

          <FormInput id="email" label="Email address">
            <input id="email" type="text" {...updateAccountForm.inputs.email} />
            <Chip className="mini" error={updateAccountForm.formState.errors.email} />
          </FormInput>

          <FormInput id="password" label="Password">
            <Row className="hidden">
              <input id="password" type={passwordVisible ? 'text' : 'password'} {...updateAccountForm.inputs.password} />
              <ButtonSet>
                <HideShowButton visible={passwordVisible} onClick={() => setPasswordVisible(!passwordVisible)} />
              </ButtonSet>
            </Row>
            {updateAccountForm.formState.errors.password && <Chip className="mini" error={updateAccountForm.formState.errors.password} />}
          </FormInput>

          <ButtonSet>
            <SaveButton type="submit" className="fill" />
            <ResetButton onClick={resetAccountUpdate} />
          </ButtonSet>
        </FormGroup>
      </form>

      <FormGroup name="Danger zone">
        <p>
          If you would like to stop using Herda, you can delete your account and all your data.
        </p>

        <Notice className="warn">Account deletion is not reversible. Proceed with care.</Notice>

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
      </FormGroup>
    </Main>
  )
}
