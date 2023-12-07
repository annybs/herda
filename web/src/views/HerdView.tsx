import './HerdView.scss'
import BackButton from '@/components/button/BackButton'
import Button from '@/components/button/Button'
import ButtonSet from '@/components/ButtonSet'
import Chip from '@/components/Chip'
import CreateButton from '@/components/button/CreateButton'
import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
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
import SortableRow from '@/components/SortableRow'
import api from '@/api'
import { useForm } from 'react-hook-form'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useRouteSearch, useSession } from '@/hooks'
import { useNavigate, useParams } from 'react-router-dom'

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

  const [data, setData] = useState<api.GetHerdResponse>()
  const [taskData, setTaskData] = useState<api.SearchResponse<api.GetTaskResponse>>()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)

  const disableSorting = Boolean(searchParams.search)

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

  async function moveTask({ active, over }: DragEndEvent) {
    if (busy || !taskData || !over || active.id === over.id) return

    const activeIdx = taskData.results.findIndex(({ task }) => task._id === active.id)
    const overIdx = taskData.results.findIndex(({ task }) => task._id === over.id)
    if (activeIdx < 0 || overIdx < 0) return
    const target = taskData.results[overIdx]

    try {
      setBusy(true)
      setError(undefined)
      const update = await api.moveTask(options, active.id.toString(), target.task.position)
      // Hot reorder tasks
      const results = activeIdx < overIdx
        // Task moved down
        ? [
          ...taskData.results.slice(0, overIdx + 1).filter(({ task }) => task._id !== update.task._id),
          update,
          ...taskData.results.slice(overIdx +1),
        ]
        // Task moved up
        : [
          ...taskData.results.slice(0, overIdx),
          update,
          ...taskData.results.slice(overIdx).filter(({ task }) => task._id !== update.task._id),
        ]
      setTaskData({ ...taskData, results })
    } catch (err) {
      setError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  async function toggleTaskDone(task: api.WithId<api.Task>) {
    try {
      setBusy(true)
      setError(undefined)
      const update = await api.toggleTaskDone(options, task._id)
      const inPageTask = taskData?.results.find(({ task }) => task._id === update.task._id)
      if (inPageTask) inPageTask.task.done = update.task.done
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
          <DndContext onDragEnd={moveTask}>
            <SortableContext
              items={taskData.results.map(({ task }) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              {taskData.results.map(({ task }, i) => (
                <SortableRow key={task._id} id={task._id} className={`task ${task.done ? 'done' : 'not-done'}`} disabled={disableSorting}>
                  <div className="position">{i + 1 + ((page - 1) * limit)}</div>
                  <div className="description">{task.description}</div>
                  <ButtonSet>
                    {task.done ? (
                      <Button className="positive mini fill" onClick={() => toggleTaskDone(task)}>
                        <CheckCircleIcon />
                        <span>Done</span>
                      </Button>
                    ) : (
                      <Button className="negative mini" onClick={() => toggleTaskDone(task)}>
                        <XCircleIcon />
                        <span>Not done</span>
                      </Button>
                    )}
                  </ButtonSet>
                </SortableRow>
              ))}
            </SortableContext>
          </DndContext>

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
