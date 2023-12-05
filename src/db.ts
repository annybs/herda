import type { AccountModel } from './account/model'
import type { Context } from './types'
import { MongoClient } from 'mongodb'
import createAccountModel from './account/model'

export interface Models {
  account: AccountModel
}

async function createDatabase(ctx: Context) {
  const mongo = await MongoClient.connect(ctx.config.mongo.uri)
  const db = mongo.db(ctx.config.mongo.db)

  const dbCtx = { ...ctx, mongo, db }
  const model = <Models>{
    account: createAccountModel(dbCtx),
  }

  return { mongo, db, model }
}

export default createDatabase
