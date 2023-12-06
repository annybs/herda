import * as account from './account/api'
import * as herd from './herd/api'
import * as task from './task/api'
import type { Context } from './types'
import type { ErrorRequestHandler } from 'express'
import express from 'express'
import { http } from '@edge/misc-utils'

/** Create an Express application. */
function createExpress(ctx: Context) {
  // Initialize app with JSON and auth middleware
  const app = express()
  app.use(express.json())
  app.use(ctx.auth.verifyRequestMiddleware)

  const prefix = ctx.config.api.prefix

  // Account APIs
  app.post(`${prefix}/account`, account.createAccount(ctx))
  app.get(`${prefix}/account/:id?`, account.getAccount())
  app.put(`${prefix}/account/:id?`, account.updateAccount(ctx))
  app.delete(`${prefix}/account/:id?`, account.deleteAccount(ctx))

  // Herd APIs
  app.get(`${prefix}/herds`, herd.searchHerds(ctx))
  app.post(`${prefix}/herd`, herd.createHerd(ctx))
  app.get(`${prefix}/herd/:id`, herd.getHerd(ctx))
  app.put(`${prefix}/herd/:id`, herd.updateHerd(ctx))
  app.delete(`${prefix}/herd/:id`, herd.deleteHerd(ctx))

  // Task APIs
  app.get(`${prefix}/tasks`, task.searchTasks(ctx))
  app.get(`${prefix}/herd/:herd/tasks`, task.searchTasks(ctx))
  app.post(`${prefix}/task`, task.createTask(ctx))
  app.get(`${prefix}/task/:id`, task.getTask(ctx))
  app.put(`${prefix}/task/:id`, task.updateTask(ctx))
  app.delete(`${prefix}/task/:id`, task.deleteTask(ctx))

  // Task patch APIs
  app.patch(`${prefix}/task/:id/done`, task.toggleTaskDone(ctx))
  app.patch(`${prefix}/task/:id/move/:position`, task.moveTask(ctx))

  // Authentication APIs
  app.post(`${prefix}/login/account`, account.loginAccount(ctx))

  // Add middleware to handle any errors forwarded from previous handlers via `next(err)`
  const catchError: ErrorRequestHandler = (err, req, res, next) => {
    if (!res.headersSent) {
      http.internalServerError(res, next, { reason: (err as Error).message })
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

export default createExpress
