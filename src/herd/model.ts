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

    const exists = await collection.indexExists('_account_1_name_1')
    if (!exists) {
      await collection.createIndex({ _account: 1, name: 1 }, { unique: true })
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
    init,
    update,
  }
}

export default createHerdModel
