import * as v from '../validate'
import type { AuthRequestHandler } from '../auth'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { WithId } from 'mongodb'
import type { Herd, HerdCreate, HerdUpdate } from './types'
import { sendBadRequest, sendForbidden, sendNotFound, sendUnauthorized } from '../http'

/** Create a herd. */
export function createHerd({ model }: Context): AuthRequestHandler {
  interface RequestData {
    herd: HerdCreate<string>
  }

  interface ResponseData {
    herd: WithId<Herd>
  }

  const readRequestData = v.validate<RequestData>({
    herd: {
      _account: v.seq(v.str, v.exactLength(24)),
      name: v.seq(v.str, v.minLength(1)),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Read input
      const input = readRequestData(req.body)

      // Assert ability to assign herd
      if (!req.account._id.equals(input.herd._account)) return sendForbidden(res, next)

      // Create herd
      const herd = await model.herd.create({ ...input.herd, _account: req.account._id })
      if (!herd) return sendNotFound(res, next, { reason: 'unexpectedly failed to get new herd' })

      // Send output
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

/** Delete a herd. */
export function deleteHerd({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    herd: WithId<Herd>
  }

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Assert access to herd
      const herd = await model.herd.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!herd) return sendNotFound(res, next)
      if (!req.account._id.equals(herd._account)) return sendForbidden(res, next)

      // Delete herd
      /** @todo delete related data */
      await model.herd.collection.deleteOne({ _id: herd._id })

      // Send output
      const output: ResponseData = { herd }
      res.send(output)
      next()
    } catch (err) {
      next(err)
    }
  }
}

/** Get a herd. */
export function getHerd({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    herd: WithId<Herd>
  }

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Assert access to herd
      const herd = await model.herd.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!herd) return sendNotFound(res, next)
      if (!req.account._id.equals(herd._account)) return sendForbidden(res, next)

      // Send output
      const output: ResponseData = { herd }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

/** Update a herd. */
export function updateHerd({ model }: Context): AuthRequestHandler {
  interface RequestData {
    herd: HerdUpdate<string>
  }

  interface ResponseData {
    herd: WithId<Herd>
  }

  const readRequestData = v.validate<RequestData>({
    herd: {
      _account: v.seq(v.optional, v.str, v.exactLength(24)),
      name: v.seq(v.optional, v.str, v.minLength(1)),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    try {
      // Assert access to herd
      let herd = await model.herd.collection.findOne({ _id: new ObjectId(req.params.id) })
      if (!herd) return sendNotFound(res, next)
      if (!req.account._id.equals(herd._account)) return sendForbidden(res, next)

      // Read input
      const input = readRequestData(req.body)
      if (!input.herd._account && !input.herd.name) {
        return sendBadRequest(res, next, { reason: 'no changes' })
      }

      // Assert ability to assign herd, if specified in update
      if (input.herd._account) {
        if (!req.account._id.equals(input.herd._account)) return sendForbidden(res, next)
      }

      // Update herd
      herd = await model.herd.update(herd._id, {
        ...input.herd,
        _account: input.herd._account && new ObjectId(input.herd._account) || undefined,
      })
      if (!herd) return sendNotFound(res, next)

      // Send output
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
