import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import type { Account, AccountCreate, AccountUpdate } from './types'

export type AccountModel = Awaited<ReturnType<typeof createAccountModel>>

async function createAccountModel(ctx: Context) {
  const collection = ctx.db.collection<Account>('account')

  async function create(input: AccountCreate) {
    const passwordSalt = generateSalt()
    const password = hashPassword(input.password, passwordSalt)

    const result = await collection.insertOne({
      email: input.email,
      password,
      passwordSalt,
    })

    return await collection.findOne({ _id: result.insertedId })
  }

  function generateSalt() {
    return crypto.randomBytes(32).toString('hex')
  }

  function hashPassword(password: string, salt: string) {
    return crypto.createHmac('sha256', salt).update(password).digest('hex')
  }

  async function init() {
    const exists = await collection.indexExists('unq_email')
    if (!exists) {
      await collection.createIndex({ email: 1 }, { unique: true })
    }
  }

  async function update(id: ObjectId | string, input: AccountUpdate) {
    const changes = <Partial<Account>>{}
    if (input.email) changes.email = input.email
    if (input.password) {
      changes.passwordSalt = crypto.randomBytes(32).toString('hex')
      changes.password = crypto.createHmac('sha256', changes.passwordSalt).update(input.password).digest('hex')
    }

    return collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: changes },
      { returnDocument: 'after' },
    )
  }

  await init()

  return {
    collection,
    create,
    generateSalt,
    hashPassword,
    init,
    update,
  }
}

export default createAccountModel
