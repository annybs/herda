import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { Task } from '../task/types'
import type { Herd, HerdCreate, HerdUpdate } from './types'

/** Model for accessing and managing herds. */
export type HerdModel = Awaited<ReturnType<typeof createHerdModel>>

/** Create a herd model. */
async function createHerdModel(ctx: Context) {
  const collection = ctx.db.collection<Herd>('herd')
  const taskCollection = ctx.db.collection<Task>('task')

  /** Create a herd. */
  async function create(input: HerdCreate) {
    const result = await collection.insertOne({
      _account: input._account,
      name: input.name,
    })

    return await collection.findOne({ _id: result.insertedId })
  }

  /** Initialize the herd collection. */
  async function init() {
    await ctx.db.createCollection('herd')

    const exists = await collection.indexExists('_account_1_name_1')
    if (!exists) {
      await collection.createIndex({ _account: 1, name: 1 }, { unique: true })
    }
  }

  /**
   * Delete a herd.
   * This function removes all tasks associated with the herd and returns the number of tasks deleted.
   */
  async function _delete(id: ObjectId) {
    if (ctx.config.mongo.useTransactions) return _deleteTx(id)

    // Delete tasks
    const { deletedCount } = await taskCollection.deleteMany({ _herd: id })

    // Delete herd
    await collection.deleteOne({ _id: id })

    return deletedCount
  }

  /** Delete a herd using a transaction. */
  async function _deleteTx(id: ObjectId) {
    const session = ctx.mongo.startSession()
    try {
      session.startTransaction()

      // Delete tasks
      const { deletedCount } = await taskCollection.deleteMany({ _herd: id }, { session })

      // Delete herd
      await collection.deleteOne({ _id: id })

      // Commit and return
      await session.commitTransaction()
      return deletedCount
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      await session.endSession()
    }
  }

  /**
   * Update a herd.
   */
  async function update(id: ObjectId | string, input: HerdUpdate) {
    const changes = <Partial<Herd>>{}
    if (input.name) changes.name = input.name

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
    delete: _delete,
    init,
    update,
  }
}

export default createHerdModel
