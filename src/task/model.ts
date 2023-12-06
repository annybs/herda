import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { Task, TaskCreate, TaskUpdate } from './types'

/** Model for accessing and managing tasks. */
export type TaskModel = Awaited<ReturnType<typeof createTaskModel>>

/** Create a task model. */
async function createTaskModel(ctx: Context) {
  const collection = ctx.db.collection<Task>('task')

  /** Create a task. */
  async function create(input: TaskCreate) {
    const result = await collection.insertOne({
      _herd: input._herd,
      _account: input._account,
      description: input.description,
      position: input.position,
    })

    return await collection.findOne({ _id: result.insertedId })
  }

  /** Initialize the task collection. */
  async function init() {
    await ctx.db.createCollection('task')
  }

  /**
   * Update a task.
   */
  async function update(id: ObjectId | string, input: TaskUpdate) {
    const changes = <Partial<Task>>{}
    if (input._herd) changes._herd = input._herd
    if (input._account) changes._account = input._account
    if (input.description) changes.description = input.description
    if (input.position !== undefined) changes.position = input.position

    return collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: changes },
      { returnDocument: 'after' },
    )
  }

  // Initialize on startup
  await init()

  return {
    collection,
    create,
    init,
    update,
  }
}

export default createTaskModel
