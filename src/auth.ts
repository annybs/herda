import type { Context } from './types'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

export type Auth = ReturnType<typeof createAuth>

export type AuthRequest = Request & {
  accountId?: ObjectId
  verified?: boolean
}

export type AuthRequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => void | Promise<void>

function createAuth(ctx: Context) {
  const { expiresIn, secret } = ctx.config.auth.jwt

  function sign(accountId: ObjectId | string): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign({ _id: accountId.toString() }, secret, { expiresIn }, (err, enc) => {
        if (err) return rej(err)
        if (enc) return res(enc)
        rej(new Error('no result'))
      })
    })
  }

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

  async function verifyRequest(req: Request): Promise<ObjectId | undefined> {
    const header = req.header('authorization')
    if (!header) return
    if (!/^[Bb]earer /.test(header)) return
    const token = header.substring(7);
    (req as AuthRequest).accountId = await verify(token);
    (req as AuthRequest).verified = true
  }

  return { sign, verify, verifyRequest }
}

export default createAuth
