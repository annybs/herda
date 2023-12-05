import * as account from './account/api'
import type { Context } from './types'
import express from 'express'
import type { ErrorRequestHandler, NextFunction, Response } from 'express'

/** Create an Express application. */
export function createExpress(ctx: Context) {
  // Initialize app with JSON middleware
  const app = express()
  app.use(express.json())

  // Add request verification middleware.
  // See ./auth.ts
  app.use(async (req, res, next) => {
    try {
      await ctx.auth.verifyRequest(req)
    } catch (err) {
      ctx.log.warn('Failed to verify request', err)
    }
    next()
  })

  const prefix = ctx.config.api.prefix

  // Account APIs
  app.post(`${prefix}/account`, account.createAccount(ctx))
  app.get(`${prefix}/account/:id?`, account.getAccount(ctx))
  app.put(`${prefix}/account/:id?`, account.updateAccount(ctx))
  app.delete(`${prefix}/account/:id?`, account.deleteAccount(ctx))

  // Authentication APIs
  app.post(`${prefix}/login/account`, account.loginAccount(ctx))

  // Add middleware to handle any errors forwarded from previous handlers via `next(err)`
  const catchError: ErrorRequestHandler = (err, req, res, next) => {
    if (!res.headersSent) {
      sendInternalServerError(res, next, { reason: (err as Error).message })
    }
    ctx.log.error(err)
  }
  app.use(catchError)

  // Add request logging middleware
  app.use((req, res, next) => {
    ctx.log.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.url} ${res.statusCode}`)
    next()
  })

  return app
}

/** Send a 400 Bad Request error response. */
export function sendBadRequest(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(400).send({ message: 'Bad Request', ...data })
  next()
}

/** Send a 403 Forbidden error response. */
export function sendForbidden(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(403).send({ message: 'Forbidden', ...data })
  next()
}

/** Send a 500 Internal Server Error response. */
export function sendInternalServerError(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(500).send({ message: 'Internal Server Error', ...data })
  next()
}

/** Send a 404 Not Found error response. */
export function sendNotFound(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(404).send({ message: 'Not Found', ...data })
  next()
}

/** Send a 401 Unauthorized error response. */
export function sendUnauthorized(res: Response, next: NextFunction, data?: Record<string, unknown>) {
  res.status(401).send({ message: 'Unauthorized', ...data })
  next()
}
