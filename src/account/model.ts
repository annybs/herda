import type { Context } from '../types'

export type AccountModel = ReturnType<typeof createAccountModel>

function createAccountModel(ctx: Context) {
  const collection = ctx.db.collection('account')

  return {
    collection,
  }
}

export default createAccountModel
