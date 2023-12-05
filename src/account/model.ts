import type { Account } from './types'
import type { Context } from '../types'
import type { WithId } from 'mongodb'

export type AccountModel = Awaited<ReturnType<typeof createAccountModel>>

async function createAccountModel(ctx: Context) {
  const collection = ctx.db.collection<Account>('account')

  async function create(input: Account): Promise<WithId<Account>> {
    const result = await collection.insertOne(input)
    return { ...input, _id: result.insertedId }
  }

  async function init() {
    const exists = await collection.indexExists('unq_email')
    if (!exists) {
      await collection.createIndex({ email: 1 }, { unique: true })
    }
  }

  await init()

  return {
    collection,
    create,
    init,
  }
}

export default createAccountModel
