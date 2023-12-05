import * as account from './account/api'
import type { Context } from './types'
import express from 'express'

export function createExpress(ctx: Context) {
  const app = express()
  const prefix = ctx.config.api.prefix

  app.get(`${prefix}/account`, account.getAccount(ctx))
  app.put(`${prefix}/account`, account.getAccount(ctx))
  app.post(`${prefix}/account`, account.createAccount(ctx))
  app.delete(`${prefix}/account`, account.deleteAccount(ctx))

  // Log request after handling
  app.use((req, res, next) => {
    ctx.log.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.url} ${res.statusCode}`)
    next()
  })

  return app
}
