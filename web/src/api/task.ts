import type { Options, SearchParams, SearchResponse, SomeRequired, WithId } from './lib'
import { request, writeSearchParams } from './lib'

/** Task data. */
export interface Task {
  /** Herd ID. */
  _herd: string
  /** Account ID reflecting the task assignee. */
  _account: string
  /** Description. */
  description: string
  /** Position in herd. */
  position: number
  /** Flag signifying whether the task is done. */
  done: boolean
}

/** Create task request data. */
export interface CreateTaskRequest {
  task: SomeRequired<Task, '_herd' | '_account' | 'description'>
}

/** Create task response data. */
export interface CreateTaskResponse {
  task: WithId<Task>
}

/** Delete task response data. */
export interface DeleteTaskResponse {
  task: WithId<Task>
}

/** Get task response data. */
export interface GetTaskResponse {
  task: WithId<Task>
}

/** Move task response data. */
export interface MoveTaskResponse {
  task: WithId<Task>
  tasks: {
    affectedCount: number
  }
}

/** Toggle task done response data. */
export interface ToggleTaskDoneResponse {
  task: WithId<Task>
}

/** Update task request data. */
export interface UpdateTaskRequest {
  task: Partial<Task>
}

/** Update task response data. */
export interface UpdateTaskResponse {
  task: WithId<Task>
}

/** Create a task. */
export async function createTask(opt: Options, data: CreateTaskRequest): Promise<CreateTaskResponse> {
  return request(opt, 'POST', '/task', undefined, data)
}

/** Delete a task. */
export async function deleteTask(opt: Options, id: string): Promise<DeleteTaskResponse> {
  return request(opt, 'DELETE', `/task/${id}`)
}

/** Get a task. */
export async function getTask(opt: Options, id: string): Promise<GetTaskResponse> {
  return request(opt, 'GET', `/task/${id}`)
}

/** Move a task. */
export async function moveTask(opt: Options, id: string, position: number): Promise<MoveTaskResponse> {
  return request(opt, 'PATCH', `/task/${id}/move/${position}`)
}

/** Search tasks. */
export async function searchTasks(opt: Options, herd?: string, params?: SearchParams): Promise<SearchResponse<GetTaskResponse>> {
  return request(opt, 'GET', herd ? `/herd/${herd}/tasks` : '/tasks', params && writeSearchParams(params))
}

/** Toggle task done status. */
export async function toggleTaskDone(opt: Options, id: string): Promise<ToggleTaskDoneResponse> {
  return request(opt, 'PATCH', `/task/${id}/done`)
}

/** Update a task. */
export async function updateTask(opt: Options, id: string, data: UpdateTaskRequest): Promise<UpdateTaskResponse> {
  return request(opt, 'PUT', `/task/${id}`, undefined, data)
}
