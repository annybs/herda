import * as account from './account/api'
import type { Context } from './types'
import express from 'express'
import type { ErrorRequestHandler, NextFunction, Response } from 'express'

export function createExpress(ctx: Context) {
  const app = express()

  app.use(express.json())

  app.use(async (req, res, next) => {
    try {
      await ctx.auth.verifyRequest(req)
    } catch (err) {
      ctx.log.warn('Failed to verify request', err)
    }
    next()
  })

  const prefix = ctx.config.api.prefix

  app.post(`${prefix}/account`, account.createAccount(ctx))
  app.get(`${prefix}/account/:id?`, account.getAccount(ctx))
  app.put(`${prefix}/account/:id?`, account.updateAccount(ctx))
  app.delete(`${prefix}/account/:id?`, account.deleteAccount(ctx))

  app.post(`${prefix}/login/account`, account.loginAccount(ctx))

  // Handle errors passed to next function
  const catchError: ErrorRequestHandler = (err, req, res, next) => {
    if (!res.headersSent) {
      sendInternalServerError(res, next, { reason: (err as Error).message })
    }
    ctx.log.error(err)
  }
  app.use(catchError)

  // Log request after handling
  app.use((req, res, next) => {
    ctx.log.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.url} ${res.statusCode}`)
    next()
  })

  return app
}

export function sendBadRequest(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(400).send({ message: 'Bad Request', ...data })
  next()
}

export function sendForbidden(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(403).send({ message: 'Forbidden', ...data })
  next()
}

export function sendInternalServerError(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(500).send({ message: 'Internal Server Error', ...data })
  next()
}

export function sendNotFound(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(404).send({ message: 'Not Found', ...data })
  next()
}

export function sendUnauthorized(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(401).send({ message: 'Unauthorized', ...data })
  next()
}
