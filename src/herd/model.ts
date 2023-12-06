import type { ClientSession } from 'mongodb'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { Herd, HerdCreate, HerdUpdate } from './types'

/** Model for accessing and managing herds. */
export type HerdModel = Awaited<ReturnType<typeof createHerdModel>>

/** Create a herd model. */
async function createHerdModel(ctx: Context) {
  const collection = ctx.db.collection<Herd>('herd')

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

    let exists = await collection.indexExists('herd_unq_account_name')
    if (!exists) {
      await collection.createIndex({ _account: 1, name: 1 }, { name: 'herd_unq_account_name', unique: true })
    }

    exists = await collection.indexExists('herd_text')
    if (!exists) {
      await collection.createIndex({ name: 'text' }, { name: 'herd_text' })
    }
  }

  /**
   * Delete a herd.
   * This function removes all tasks associated with the herd and returns the number of tasks deleted.
   */
  async function _delete(id: ObjectId, session?: ClientSession) {
    // Delete tasks
    const { deletedCount } = await ctx.ctx().model.task.collection.deleteMany({ _herd: id }, { session })

    // Delete herd
    const herd = await collection.findOneAndDelete({ _id: id }, { session })

    return { herd, deletedCount }
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
