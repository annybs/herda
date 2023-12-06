import './HerdView.scss'
import BackButton from '@/components/button/BackButton'
import Button from '@/components/button/Button'
import ButtonSet from '@/components/ButtonSet'
import CreateButton from '@/components/button/CreateButton'
import FormGroup from '@/components/form/FormGroup'
import FormInput from '@/components/form/FormInput'
import LoadingIndicator from '@/components/LoadingIndicator'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import Pagination from '@/components/Pagination'
import ResetButton from '@/components/button/ResetButton'
import Row from '@/components/Row'
import SaveButton from '@/components/button/SaveButton'
import SearchForm from '@/components/SearchForm'
import api from '@/api'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useRouteSearch, useSession } from '@/hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Chip from '@/components/Chip'

interface HerdUpdateFormData extends Pick<api.Herd, 'name'> {}

interface TaskCreateFormData extends Pick<api.Task, 'description'> {}

function useHerdUpdateForm() {
  const form = useForm<HerdUpdateFormData>({ mode: 'onBlur' })

  const inputs = {
    name: form.register('name', { validate: value => {
      if (value.length < 1) return 'Required'
    }}),
  }

  return { ...form, inputs }
}

function useTaskCreateForm() {
  const form = useForm<TaskCreateFormData>({ mode: 'onBlur' })

  const inputs = {
    description: form.register('description', { validate: value => {
      if (value.length < 1) return 'Required'
    }}),
  }

  return { ...form, inputs }
}

export default function HerdView() {
  const { account } = useSession()
  const { id } = useParams()
  const createTaskForm = useTaskCreateForm()
  const updateHerdForm = useHerdUpdateForm()
  const navigate = useNavigate()
  const { options } = useConnection()
  const { limit, page, searchParams, setPage } = useRouteSearch()

  const [busy, setBusy] = useState(false)
  const [data, setData] = useState<api.GetHerdResponse>()
  const [taskData, setTaskData] = useState<api.SearchResponse<api.GetTaskResponse>>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)

  async function createTask(data: TaskCreateFormData) {
    if (busy) return

    try {
      setBusy(true)
      setError(undefined)
      await api.createTask(options, {
        task: {
          _herd: id || '',
          _account: account?._id || '',
          description: data.description,
        },
      })
      createTaskForm.reset({ description: '' })
      if (taskData && taskData.results.length >= limit) {
        // New task will be on a new page; change page to display it
        setPage(page + 1)
      } else {
        // Reload current page
        const taskRes = await api.searchTasks(options, id, searchParams)
        setTaskData(taskRes)
      }
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
        const taskRes = await api.searchTasks(options, id, searchParams)
        setTaskData(taskRes)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
  }, [id, options, searchParams])

  async function updateHerd(data: HerdUpdateFormData) {
    if (busy) return

    try {
      setBusy(true)
      setError(undefined)
      const res = await api.updateHerd(options, id as string, {
        herd: data,
      })
      setData(res)
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    reload()
  }, [reload])

  if (loading) return (
    <Main>
      <header>
        {id ? <h1>Loading Herd...</h1> : <h1>Create Herd</h1>}
      </header>

      <LoadingIndicator />
    </Main>
  )

  if (error) return (
    <Main>
      <header>
        {id ? <h1>Loading Herd...</h1> : <h1>Create Herd</h1>}

        <ButtonSet>
          <BackButton />
        </ButtonSet>
      </header>

      <Notice error={error} />
    </Main>
  )

  return data && (
    <Main>
      <header>
        <h1>{data.herd.name}</h1>

        <ButtonSet>
          <BackButton onClick={() => navigate('/')} />
        </ButtonSet>
      </header>

      <SearchForm />

      <Notice error={error} />

      {taskData && (
        <>
          {taskData.results.map(({ task }) => (
            <Row key={task._id} className={`task ${task.done ? 'done' : 'not-done'}`}>
              <div className="position">{task.position}</div>
              <div className="description">{task.description}</div>
              <ButtonSet>
                {task.done ? (
                  <Button className="positive mini fill">
                    <CheckCircleIcon />
                    <span>Done</span>
                  </Button>
                ) : (
                  <Button className="negative mini">
                    <XCircleIcon />
                    <span>Not done</span>
                  </Button>
                )}
              </ButtonSet>
            </Row>
          ))}

          <form onSubmit={createTaskForm.handleSubmit(createTask)}>
            <FormGroup name="Add a task">
              <FormInput>
                <Row>
                  <input id="description" type="text" {...createTaskForm.inputs.description} />
                  <ButtonSet>
                    <CreateButton type="submit" className="fill" />
                  </ButtonSet>
                </Row>
                <Chip className="mini" error={createTaskForm.formState.errors.description} />
              </FormInput>
            </FormGroup>
          </form>

          <Pagination totalCount={taskData.metadata.totalCount} />

          <form onSubmit={updateHerdForm.handleSubmit(updateHerd)}>
            <FormGroup name="Edit herd">
              <FormInput id="herd:name" label="Name">
                <input id="herd:name" type="text" {...updateHerdForm.inputs.name} />
                <Chip className="mini" error={updateHerdForm.formState.errors.name} />
              </FormInput>

              <ButtonSet>
                <SaveButton type="submit" className="fill" />
                <ResetButton type="reset" />
              </ButtonSet>
            </FormGroup>
          </form>
        </>
      )}

    </Main>
  )
}
