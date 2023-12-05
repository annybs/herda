import type { AccountModel } from './account/model'
import type { Context } from './types'
import { MongoClient } from 'mongodb'
import createAccountModel from './account/model'

/**
 * Models context.
 * Provides access to various backend functionality.
 */
export interface Models {
  account: AccountModel
}

/** Create a MongoDB connection and initialize models. */
async function createDatabase(ctx: Context) {
  // Connect to MongoDB and select database
  const mongo = await MongoClient.connect(ctx.config.mongo.uri)
  const db = mongo.db(ctx.config.mongo.db)

  // Create a temporary context and set up models.
  // Some models may self-initialize to install indexes etc.
  const dbCtx = { ...ctx, mongo, db }
  const model = <Models>{
    account: await createAccountModel(dbCtx),
  }

  return { mongo, db, model }
}

export default createDatabase
