import type { Account } from './account/types'
import type { Context } from './types'
import { ObjectId } from 'mongodb'
import type { WithId } from 'mongodb'
import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

/**
 * Authentication context.
 * This provides functionality for signing and verifying JWTs using static configuration.
 *
 * @see https://jwt.io/introduction
 */
export type Auth = ReturnType<typeof createAuth>

/** AuthRequest is an Express Request with some additional properties. */
export type AuthRequest = Request & {
  /**
   * Account document set by authentication middleware.
   * If this value exists, then the the request is authenticated with this account.
   *
   * @see Auth.verifyRequestMiddleware
   */
  account?: WithId<Account>
}

/**
 * An AuthRequestHandler is essentially the same as an Express RequestHandler, but has access to additional request
 * properties when `verifyRequest` is used earlier in request processing.
 *
 * @see AuthRequest
 */
export type AuthRequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => void | Promise<void>

/**
 * Create an authentication context.
 * This provides functionality for signing and verifying JWTs using static configuration.
 *
 * @see https://jwt.io/introduction
 */
function createAuth(ctx: Context) {
  const { expiresIn, secret } = ctx.config.auth.jwt

  /** Sign a JWT containing an account ID. */
  function sign(accountId: ObjectId | string): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign({ _id: accountId.toString() }, secret, { expiresIn }, (err, enc) => {
        if (err) return rej(err)
        if (enc) return res(enc)
        rej(new Error('no result'))
      })
    })
  }

  /** Verify and decode a JWT containing an account ID. */
  function verify(token: string): Promise<ObjectId> {
    return new Promise((res, rej) => {
      jwt.verify(token, secret, (err, dec) => {
        if (err) return rej(err)
        try {
          const id = new ObjectId((dec as { _id: string })._id)
          res(id)
        } catch (err) {
          rej(err)
        }
      })
    })
  }

  /**
   * Express middleware to verify and decode a JWT provided in an HTTP request's authorization header.
   *
   * If an account ID is successfully decoded from the JWT, this will attempt to load the account automatically before
   * further request processing.
   * The account is attached to the request and tacitly available to subsequent request handlers that implement the
   * AuthRequestHandler type.
   *
   * If an invalid token is provided or the account does not exist, an error will be passed along, blocking request
   * handling.
   */
  const verifyRequestMiddleware: AuthRequestHandler = async (req, res, next) => {
    // Read header and skip processing if bearer token missing or malformed
    const header = req.header('authorization')
    if (!header) return next()
    if (!/^[Bb]earer /.test(header)) return next()

    try {
      // Read and verify token
      const token = header.substring(7)
      const _id = await verify(token)

      // Load account
      const account = await ctx.model.account.collection.findOne({ _id })
      if (!account) throw new Error(`account ${_id.toString()} not found`)
      req.account = account
      next()
    } catch (err) {
      return next(err)
    }
  }

  return { sign, verify, verifyRequestMiddleware }
}

export default createAuth
