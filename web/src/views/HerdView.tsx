import './HerdView.scss'
import BackButton from '@/components/button/BackButton'
import Button from '@/components/button/Button'
import ButtonSet from '@/components/ButtonSet'
import Chip from '@/components/Chip'
import CreateButton from '@/components/button/CreateButton'
import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import EditButton from '@/components/button/EditButton'
import FormGroup from '@/components/form/FormGroup'
import FormInput from '@/components/form/FormInput'
import LoadingIndicator from '@/components/LoadingIndicator'
import Main from '@/components/Main'
import Notice from '@/components/Notice'
import Pagination from '@/components/Pagination'
import Placeholder from '@/components/Placeholder'
import Row from '@/components/Row'
import SaveButton from '@/components/button/SaveButton'
import SearchForm from '@/components/SearchForm'
import SortableRow from '@/components/SortableRow'
import type { SubmitHandler } from 'react-hook-form'
import ToggleButton from '@/components/button/ToggleButton'
import api from '@/api'
import { useForm } from 'react-hook-form'
import { CheckCircleIcon, CloudIcon, TrashIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useDocument, useRouteSearch, useSession } from '@/hooks'
import { useNavigate, useParams } from 'react-router-dom'

interface TaskCreateFormData extends Pick<api.Task, 'description'> {}

interface TaskUpdateFormData extends Pick<api.Task, 'description'> {}

function useTaskCreateForm() {
  const form = useForm<TaskCreateFormData>({ mode: 'onSubmit' })

  const inputs = {
    description: form.register('description', { validate: value => {
      if (value.length < 1) return 'Required'
    }}),
  }

  return { ...form, inputs }
}

function useTaskUpdateForm() {
  const form = useForm<TaskUpdateFormData>({ mode: 'onBlur' })

  const inputs = {
    description: form.register('description', { validate: value => {
      if (value.length < 1) return 'Required'
    }}),
  }

  return { ...form, inputs }
}

export default function HerdView() {
  const { account } = useSession()
  const createForm = useTaskCreateForm()
  const doc = useDocument()
  const { id } = useParams()
  const navigate = useNavigate()
  const { options } = useConnection()
  const updateForm = useTaskUpdateForm()
  const { filter, limit, page, searchParams, setFilters, setPage } = useRouteSearch()

  const [data, setData] = useState<api.GetHerdResponse>()
  const [taskData, setTaskData] = useState<api.SearchResponse<api.GetTaskResponse>>()

  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<string>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)

  const disableSorting = Boolean(searchParams.search)
  const showCompleted = filter.includes('showCompleted')

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
      createForm.reset({ description: '' })
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

  async function deleteTask(task: api.WithId<api.Task>) {
    if (busy) return

    try {
      setBusy(true)
      setError(undefined)
      await api.deleteTask(options, task._id)
      // Reload current page
      const taskRes = await api.searchTasks(options, id, searchParams)
      setTaskData(taskRes)
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

  function toggleShowCompleted() {
    if (showCompleted) setFilters([])
    else setFilters(['showCompleted'])
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

  function setTaskToEdit(task?: api.WithId<api.Task>) {
    if (task) {
      setEditing(task._id)
      updateForm.reset({ description: task.description })
    } else {
      setEditing(undefined)
    }
  }

  function updateTask(task: api.WithId<api.Task>): SubmitHandler<TaskUpdateFormData> {
    return async function(data) {
      if (busy) return

      try {
        setBusy(true)
        setError(undefined)
        const update = await api.updateTask(options, task._id, { task: data })
        const inPageTask = taskData?.results.find(({ task }) => task._id === update.task._id)
        if (inPageTask) {
          inPageTask.task.description = update.task.description
        }
        setEditing(undefined)
      } catch (err) {
        setError(err as Error)
      } finally {
        setBusy(false)
      }
    }
  }

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (data?.herd) doc.setTitle(data.herd.name)
    else if (loading) doc.setTitle('Loading herd...')
    else doc.clearTitle()
  }, [data, doc, loading])

  return (
    <Main>
      <header>
        <h1>{data?.herd.name || 'Loading herd...'}</h1>

        <ButtonSet>
          <BackButton onClick={() => navigate('/')} />
          {data && (
            <EditButton className="outline" onClick={() => navigate(`/herd/${data.herd._id}/edit`)} />
          )}
        </ButtonSet>
      </header>

      <SearchForm>
        <ButtonSet>
          <ToggleButton className="mini" toggled={showCompleted} onClick={toggleShowCompleted}>
            <span>Show completed items</span>
          </ToggleButton>
        </ButtonSet>
      </SearchForm>

      <Notice error={error} />

      {loading ? (
        <Placeholder>
          <LoadingIndicator />
        </Placeholder>
      ) : (taskData && taskData.metadata.totalCount > 0) ? (
        <DndContext onDragEnd={moveTask}>
          <SortableContext
            items={taskData.results.map(({ task }) => task._id)}
            strategy={verticalListSortingStrategy}
          >
            {taskData.results.map(({ task }, i) => (
              <SortableRow key={task._id} id={task._id} className={`task ${task.done ? 'done' : 'not-done'}`} disabled={disableSorting}>
                <div className="position">{i + 1 + ((page - 1) * limit)}</div>
                <div className="description">
                  {editing === task._id ? (
                    <form onSubmit={updateForm.handleSubmit(updateTask(task))}>
                      <Row className="edit-task">
                        <FormInput>
                          <input type="text" disabled={busy} autoFocus {...updateForm.inputs.description} />
                        </FormInput>
                        <ButtonSet>
                          <SaveButton type="submit" disabled={busy} className="mini" />
                          <Button disabled={busy} onClick={() => setTaskToEdit(undefined)} className="mini">
                            <XMarkIcon />
                            <span>Cancel</span>
                          </Button>
                        </ButtonSet>
                      </Row>
                    </form>
                  ) : (
                    <span onClick={() => setTaskToEdit(task)}>{task.description}</span>
                  )}
                </div>
                <ButtonSet>
                  {task.done ? (
                    <Button disabled={busy} className="positive mini fill" onClick={() => toggleTaskDone(task)}>
                      <CheckCircleIcon />
                      <span>Done</span>
                    </Button>
                  ) : (
                    <Button disabled={busy} className="negative mini" onClick={() => toggleTaskDone(task)}>
                      <XCircleIcon />
                      <span>Not done</span>
                    </Button>
                  )}
                  <Button disabled={busy} className="negative mini" onClick={() => deleteTask(task)}>
                    <TrashIcon />
                    <span>Delete</span>
                  </Button>
                </ButtonSet>
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <Placeholder>
          <CloudIcon />
          <span>No tasks!</span>
        </Placeholder>
      )}

      <form onSubmit={createForm.handleSubmit(createTask)}>
        <FormGroup name="Add a task">
          <FormInput>
            <Row>
              <input id="description" disabled={busy} type="text" {...createForm.inputs.description} />
              <ButtonSet>
                <CreateButton disabled={busy} type="submit" className="fill" />
              </ButtonSet>
            </Row>
            <Chip className="mini" error={createForm.formState.errors.description} />
          </FormInput>
        </FormGroup>
      </form>

      <Pagination totalCount={taskData?.metadata.totalCount || 0} />
    </Main>
  )
}
