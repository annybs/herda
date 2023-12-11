import type { AuthRequestHandler } from '../auth'
import type { Context } from '../types'
import type { RequestHandler } from 'express'
import type { WithId } from 'mongodb'
import { prepareAccount } from './http'
import type { Account, AccountCreate, AccountUpdate } from './types'
import { http, validate as v } from '@edge/misc-utils'

/** Create an account. */
export function createAccount({ model }: Context): RequestHandler {
  interface RequestData {
    account: AccountCreate
  }

  interface ResponseData {
    account: WithId<Partial<Account>>
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
      if (!account) return http.notFound(res, next, { reason: 'unexpectedly failed to get new account' })

      const output: ResponseData = { account: prepareAccount(account) }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return http.badRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}

/** Delete an account. */
export function deleteAccount({ model }: Context): AuthRequestHandler {
  interface ResponseData {
    account: WithId<Partial<Account>>
    herds: {
      deletedCount: number
    }
    tasks: {
      deletedCount: number
    }
  }

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    // Get account ID and assert access
    const id = req.params.id || req.account._id
    if (!id) return http.badRequest(res, next)
    if (!req.account._id.equals(id)) return http.forbidden(res, next)

    try {
      // Delete account
      const { account, deletedHerds, deletedTasks } = await model.account.delete(id)
      if (!account) return http.notFound(res, next)

      // Send output
      const output: ResponseData = {
        account: prepareAccount(account),
        herds: {
          deletedCount: deletedHerds,
        },
        tasks: {
          deletedCount: deletedTasks,
        },
      }
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
    account: WithId<Partial<Account>>
  }

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    // Get account ID and assert access
    const id = req.params.id || req.account._id
    if (!req.account._id.equals(id)) return http.forbidden(res, next)

    try {
      // Send output
      const output: ResponseData = { account: prepareAccount(req.account) }
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
    account: WithId<Partial<Account>>
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
      if (!account) return http.notFound(res, next)

      // Validate password
      const password = model.account.hashPassword(input.account.password, account.passwordSalt)
      if (password !== account.password) return http.badRequest(res, next, { reason: 'invalid password' })

      // Create JWT
      const token = await auth.sign(account._id)

      // Send output
      const output: ResponseData = { token, account: prepareAccount(account) }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return http.badRequest(res, next, { param: ve.param, reason: ve.message })
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
    account: WithId<Partial<Account>>
  }

  const readRequestData = v.validate<RequestData>({
    account: {
      email: v.seq(v.optional, v.email),
      password: v.seq(v.optional, v.str, v.minLength(8)),
    },
  })

  return async function (req, res, next) {
    if (!req.account) return http.unauthorized(res, next)

    // Get account ID and assert access
    const id = req.params.id || req.account._id
    if (!req.account._id.equals(id)) return http.forbidden(res, next)

    try {
      // Read input
      const input = readRequestData(req.body)
      if (!input.account.email && !input.account.password) {
        return http.badRequest(res, next, { reason: 'no changes' })
      }

      // Update account
      const account = await model.account.update(id, input.account)
      if (!account) return http.notFound(res, next)

      // Send output
      const output: ResponseData = { account: prepareAccount(account) }
      res.send(output)
      next()
    } catch (err) {
      const name = (err as Error).name
      if (name === 'ValidateError') {
        const ve = err as v.ValidateError
        return http.badRequest(res, next, { param: ve.param, reason: ve.message })
      }
      return next(err)
    }
  }
}
