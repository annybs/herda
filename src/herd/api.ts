import * as v from '../validate'
import type { AuthRequestHandler } from '../auth'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { WithId } from 'mongodb'
import type { Herd, HerdCreate, HerdUpdate } from './types'
import { sendBadRequest, sendForbidden, sendNotFound, sendUnauthorized } from '../http'

/**
 * Create a herd.
 * The request must be verified, and the user may only create a herd in their own account.
 */
export function createHerd({ model }: Context): AuthRequestHandler {
  interface RequestData {
    herd: Omit<HerdCreate, '_account'>
  }

  interface ResponseData {
    herd: WithId<Herd>
  }

  const readRequestData = v.validate<RequestData>({
    herd: {
      name: v.minLength(1),
    },
  })

  return async function (req, res, next) {
    if (!req.verified) return sendUnauthorized(res, next)

    try {
      const account = await model.account.collection.findOne({ _id: req.accountId })
      if (!account) return sendUnauthorized(res, next)

      const input = readRequestData(req.body)

      const herd = await model.herd.create({ ...input.herd, _account: req.accountId as ObjectId })
      if (!herd) return sendNotFound(res, next, { reason: 'unexpectedly failed to get new herd' })

      const output: ResponseData = { herd }
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

/**
 * Delete a herd.
 * The request must be verified, and the user may not modify any herd other than their own.
 */
export function deleteHerd({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    herd: WithId<Herd>
  }

  return async function (req, res, next) {
    if (!req.verified) return sendUnauthorized(res, next)

    const id = req.params.id
    if (!id) return sendBadRequest(res, next, { reason: 'no ID' })

    try {
      const herd = await model.herd.collection.findOne({ _id: new ObjectId(id) })
      if (!herd) return sendNotFound(res, next)
      if (!req.accountId?.equals(herd._account)) return sendForbidden(res, next)

      /** @todo delete related data */
      await model.herd.collection.deleteOne({ _id: new ObjectId(id) })

      const output: ResponseData = { herd }
      res.send(output)
      next()
    } catch (err) {
      next(err)
    }
  }
}

/**
 * Get a herd.
 * The request must be verified, and the user may not access any herd other than their own.
 */
export function getHerd({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    herd: WithId<Herd>
  }

  return async function (req, res, next) {
    if (!req.verified) return sendUnauthorized(res, next)

    const id = req.params.id || req.accountId
    if (!id) return sendBadRequest(res, next, { reason: 'no ID' })

    try {
      const herd = await model.herd.collection.findOne({ _id: new ObjectId(id) })
      if (!herd) return sendNotFound(res, next)
      if (!req.accountId?.equals(herd._account)) return sendForbidden(res, next)

      const output: ResponseData = { herd }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

/**
 * Update a herd.
 * The request must be verified, and the user may not modify any herd other than their own.
 */
export function updateHerd({ model }: Context): AuthRequestHandler {
  interface RequestData {
    herd: HerdUpdate
  }

  interface ResponseData {
    herd: WithId<Herd>
  }

  const readRequestData = v.validate<RequestData>({
    herd: {
      name: v.minLength(1),
    },
  })

  return async function (req, res, next) {
    if (!req.verified) return sendUnauthorized(res, next)

    const id = req.params.id || req.accountId
    if (!id) return sendBadRequest(res, next, { reason: 'no ID' })

    try {
      const input = readRequestData(req.body)
      if (!input.herd.name) {
        return sendBadRequest(res, next, { reason: 'no changes' })
      }

      let herd = await model.herd.collection.findOne({ _id: new ObjectId(id) })
      if (!herd) return sendNotFound(res, next)
      if (!req.accountId?.equals(herd._account)) return sendForbidden(res, next)

      herd = await model.herd.update(id, input.herd)
      if (!herd) return sendNotFound(res, next)

      const output: ResponseData = { herd }
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
