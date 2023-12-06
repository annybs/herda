import * as v from '../validate'
import type { AuthRequestHandler } from '../auth'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'
import type { RequestHandler } from 'express'
import type { WithId } from 'mongodb'
import type { Account, AccountCreate, AccountUpdate } from './types'
import { sendBadRequest, sendForbidden, sendNotFound, sendUnauthorized } from '../http'

/** Create an account. */
export function createAccount({ model }: Context): RequestHandler {
  interface RequestData {
    account: AccountCreate
  }

  interface ResponseData {
    account: WithId<Account>
  }

  const readRequestData = v.validate<RequestData>({
    account: {
      email: v.email,
      password: v.seq(v.str, v.minLength(8)),
    },
  })

  return async function (req, res, next) {
    try {
      const input = readRequestData(req.body)

      const account = await model.account.create(input.account)
      if (!account) return sendNotFound(res, next, { reason: 'unexpectedly failed to get new account' })

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

/** Delete an account. */
export function deleteAccount({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    account: WithId<Account>
  }

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    // Get account ID and assert access
    const id = req.params.id || req.account._id
    if (!id) return sendBadRequest(res, next)
    if (!req.account._id.equals(id)) return sendForbidden(res, next)

    try {
      // Delete account
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

/** Get an account. */
export function getAccount(): AuthRequestHandler {
  interface ResponseData {
    account: WithId<Account>
  }

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    // Get account ID and assert access
    const id = req.params.id || req.account._id
    if (!req.account._id.equals(id)) return sendForbidden(res, next)

    try {
      // Send output
      const output: ResponseData = { account: req.account }
      res.send(output)
      next()
    } catch (err) {
      return next(err)
    }
  }
}

/**
 * Log in to an account.
 * The token returned should be added to the authorization header of subsequent requests.
 */
export function loginAccount({ auth, model }: Context): RequestHandler {
  interface RequestData {
    account: Pick<Account, 'email' | 'password'>
  }

  interface ResponseData {
    token: string
    account: WithId<Account>
  }

  const readRequestData = v.validate<RequestData>({
    account: {
      email: v.email,
      password: v.seq(v.minLength(8)),
    },
  })

  return async function (req, res, next) {
    try {
      // Read input
      const input = readRequestData(req.body)

      // Get account
      const account = await model.account.collection.findOne({ email: input.account.email })
      if (!account) return sendNotFound(res, next)

      // Validate password
      const password = model.account.hashPassword(input.account.password, account.passwordSalt)
      if (password !== account.password) return sendBadRequest(res, next, { reason: 'invalid password' })

      // Create JWT
      const token = await auth.sign(account._id)

      // Send output
      const output: ResponseData = { token, account }
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

/** Update an account. */
export function updateAccount({ model }: Context): AuthRequestHandler {
  interface RequestData {
    account: AccountUpdate
  }

  interface ResponseData {
    account: WithId<Account>
  }

  const readRequestData = v.validate<RequestData>({
    account: {
      email: v.seq(v.optional, v.email),
      password: v.seq(v.optional, v.str, v.minLength(8)),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return sendUnauthorized(res, next)

    // Get account ID and assert access
    const id = req.params.id || req.account._id
    if (!req.account._id.equals(id)) return sendForbidden(res, next)

    try {
      // Read input
      const input = readRequestData(req.body)
      if (!input.account.email && !input.account.password) {
        return sendBadRequest(res, next, { reason: 'no changes' })
      }

      // Update account
      const account = await model.account.update(id, input.account)
      if (!account) return sendNotFound(res, next)

      // Send output
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
