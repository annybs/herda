import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import type { Account, AccountCreate, AccountUpdate } from './types'

/** Model for accessing and managing accounts. */
export type AccountModel = Awaited<ReturnType<typeof createAccountModel>>

/** Create an account model. */
async function createAccountModel(ctx: Context) {
  const collection = ctx.db.collection<Account>('account')

  /**
   * Create an account.
   * The password is automatically hashed.
   */
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

  /** Generate a salt for use in password hashing. */
  function generateSalt() {
    return crypto.randomBytes(32).toString('hex')
  }

  /** Hash a password. */
  function hashPassword(password: string, salt: string) {
    return crypto.createHmac('sha256', salt).update(password).digest('hex')
  }

  /** Initialize the account collection. */
  async function init() {
    await ctx.db.createCollection('account')

    const exists = await collection.indexExists('email_1')
    if (!exists) {
      await collection.createIndex({ email: 1 }, { unique: true })
    }
  }

  /**
   * Update an account.
   * If a password is given, it is automatically hashed with a new salt.
   */
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

  // Initialize on startup
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
