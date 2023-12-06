import type { AccountModel } from './account/model'
import type { Context } from './types'
import type { HerdModel } from './herd/model'
import { MongoClient } from 'mongodb'
import type { TaskModel } from './task/model'
import createAccountModel from './account/model'
import createHerdModel from './herd/model'
import createTaskModel from './task/model'

/**
 * Models context.
 * Provides access to various backend functionality.
 */
export interface Models {
  account: AccountModel
  herd: HerdModel
  task: TaskModel
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
    herd: await createHerdModel(dbCtx),
    task: await createTaskModel(dbCtx),
  }

  return { mongo, db, model }
}

export default createDatabase
