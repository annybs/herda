import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { Task, TaskCreate, TaskUpdate } from './types'

/** Model for accessing and managing tasks. */
export type TaskModel = Awaited<ReturnType<typeof createTaskModel>>

/** Create a task model. */
async function createTaskModel(ctx: Context) {
  const collection = ctx.db.collection<Task>('task')

  /**
   * Create a task.
   * If position is omitted, the task is added to the end of its herd.
   */
  async function create(input: TaskCreate) {
    let position = input.position
    if (!position) {
      position = 1 + await collection.countDocuments({ _herd: input._herd })
    }

    const result = await collection.insertOne({
      _herd: input._herd,
      _account: input._account,
      description: input.description,
      position,
    })

    return await collection.findOne({ _id: result.insertedId })
  }

  /** Initialize the task collection. */
  async function init() {
    await ctx.db.createCollection('task')

    const exists = await collection.indexExists('task_text')
    if (!exists) {
      await collection.createIndex({ description: 'text' }, { name: 'task_text' })
    }
  }

  /**
   * Move a task.
   * This function updates the position of all subsequent tasks and returns the total number of tasks affected.
   */
  async function move(id: ObjectId | string, position: number) {
    if (ctx.config.mongo.useTransactions) return moveTx(id, position)

    // Update specified task
    const task = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { position } },
      { returnDocument: 'after' },
    )
    // Not expected to happen, but type-safe
    if (!task) throw new Error('failed to get updated task')

    // Get subsequent tasks
    const nextTasks = collection.find({
      _herd: task._herd,
      _id: { $ne: new ObjectId(id) },
      position: { $gte: position },

    }).sort('position', 1)

    // Update subsequent tasks
    let affectedCount = 1
    for await (const task of nextTasks) {
      await collection.updateOne(
        { _id: task._id },
        { $set: { position: position + affectedCount } },
      )
      affectedCount++
    }

    return { task, affectedCount }
  }

  /** Move a task using a transaction. */
  async function moveTx(id: ObjectId | string, position: number) {
    const session = ctx.mongo.startSession()
    try {
      session.startTransaction()

      // Update specified task
      const task = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { position } },
        { returnDocument: 'after', session },
      )
      // Not expected to happen, but type-safe
      if (!task) throw new Error('failed to get updated task')

      // Get subsequent tasks
      const nextTasks = collection.find({
        _herd: task._herd,
        _id: { $ne: new ObjectId(id) },
        position: { $gte: position },
      }, { session }).sort('position', 1)

      // Update subsequent tasks
      let affectedCount = 1
      for await (const task of nextTasks) {
        await collection.updateOne(
          { _id: task._id },
          { $set: { position: position + affectedCount } },
          { session },
        )
        affectedCount++
      }

      // Commit and return
      await session.commitTransaction()
      return { task, affectedCount }
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      await session.endSession()
    }
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
    move,
    update,
  }
}

export default createTaskModel
