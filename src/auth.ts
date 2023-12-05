import type { Context } from './types'
import { ObjectId } from 'mongodb'
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
  /** Account ID decoded from JWT. */
  accountId?: ObjectId
  /**
   * Indicates whether the request is verified with a JWT.
   * This does not necessarily mean the corresponding accountId is internally valid or applicable to the contents of
   * the request; only that the JWT was in itself valid.
   */
  verified?: boolean
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
   * Verify and decode a JWT provided in an HTTP request's authorization header.
   *
   * If the JWT is verified, some additional properties are set on the request object as a side effect.
   * These properties are then available to other, subsequent request handlers that use the `AuthRequestHandler` type.
   * This function is thus suitable for use in Express middleware.
   */
  async function verifyRequest(req: Request): Promise<ObjectId | undefined> {
    const header = req.header('authorization')
    if (!header) return
    if (!/^[Bb]earer /.test(header)) return
    const token = header.substring(7)
    const accountId = await verify(token);
    (req as AuthRequest).accountId = accountId;
    (req as AuthRequest).verified = true
    return accountId
  }

  return { sign, verify, verifyRequest }
}

export default createAuth
