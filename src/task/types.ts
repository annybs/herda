import type { ObjectId } from 'mongodb'

/** Task data. */
export interface Task<T extends ObjectId | string = ObjectId> {
  /** Herd ID. */
  _herd: T
  /** Account ID reflecting the task assignee. */
  _account: T
  /** Description. */
  description: string
  /** Position in herd. */
  position: number
}

/** Subset of task data when creating a new task. */
export type TaskCreate<T extends ObjectId | string = ObjectId> = Pick<Task<T>, '_herd' | '_account' | 'description' | 'position'>

/** Subset of task data when updating a task. */
export type TaskUpdate<T extends ObjectId | string = ObjectId> = Partial<Pick<Task<T>, '_herd' | '_account' | 'description' | 'position'>>
