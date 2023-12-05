import * as v from '../validate'
import type { Account } from './types'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { RequestHandler } from 'express'
import type { WithId } from 'mongodb'
import { sendBadRequest, sendNotFound } from '../http'

export function createAccount({ model }: Context): RequestHandler {
  interface RequestData {
    account: Account
  }

  interface ResponseData {
    account: WithId<Account>
  }

  const readRequestData = v.validate<RequestData>({
    account: {
      email: v.email,
    },
  })

  return async function (req, res, next) {
    try {
      const input = readRequestData(req.body)

      const account = await model.account.create(input.account)

      const output: ResponseData = { account }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return sendBadRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}

export function deleteAccount({ model }: Context): RequestHandler {
  interface ResponseData {
    account: WithId<Account>
  }

  return async function (req, res, next) {
    /** @todo get ID from authentication */
    const id = req.params.id
    if (!id) return sendBadRequest(res, next, { reason: 'no ID' })

    try {
      /** @todo delete related data */
      const account = await model.account.collection.findOneAndDelete({ _id: new ObjectId(id) })
      if (!account) return sendNotFound(res, next)

      const output: ResponseData = { account }
      res.send(output)
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function getAccount({ model }: Context): RequestHandler {
  interface ResponseData {
    account: WithId<Account>
  }

  return async function (req, res, next) {
    /** @todo get ID from authentication */
    const id = req.params.id
    if (!id) return sendBadRequest(res, next, { reason: 'no ID' })

    try {
      const account = await model.account.collection.findOne({ _id: new ObjectId(id) })
      if (!account) return sendNotFound(res, next)

      const output: ResponseData = { account }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

export function updateAccount({ model }: Context): RequestHandler {
  interface RequestData {
    account: Partial<Account>
  }

  interface ResponseData {
    account: WithId<Account>
  }

  const readRequestData = v.validate<RequestData>({
    account: {
      email: v.seq(v.optional, v.email),
    },
  })

  return async function (req, res, next) {
    /** @todo get ID from authentication */
    const id = req.params.id
    if (!id) return sendBadRequest(res, next, { reason: 'no ID' })

    try {
      const input = readRequestData(req.body)
      if (!input.account.email) {
        return sendBadRequest(res, next, { reason: 'no data' })
      }

      const account = await model.account.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: input.account },
        { returnDocument: 'after' },
      )
      if (!account) return sendNotFound(res, next)

      const output: ResponseData = { account }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return sendBadRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}
