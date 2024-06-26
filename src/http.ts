import * as account from './account/api'
import * as herd from './herd/api'
import * as task from './task/api'
import type { Context } from './types'
import cors from 'cors'
import express from 'express'
import { http } from '@edge/misc-utils'
import { version } from '../package.json'
import type { ErrorRequestHandler, RequestHandler } from 'express'

/** Create an Express application. */
function createExpress(ctx: Context, staticsPath?: string) {
  // Initialize app with JSON, CORS, and auth middleware
  const app = express()
  app.use(express.json())
  app.use(cors(ctx.config.cors))
  app.use(ctx.auth.verifyRequestMiddleware)

  const prefix = ctx.config.api.prefix

  // Static frontend
  if (staticsPath) app.use(express.static(staticsPath, { fallthrough: true }))

  // Misc APIs
  app.get(prefix, index)

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

  // Static fallback to route to index.html
  if (staticsPath) app.get('/*', (req, res, next) => {
    if (!res.headersSent) {
      res.sendFile(`${staticsPath}/index.html`, err => {
        next(err)
      })
    } else next()
  })

  // Add middleware to handle any errors forwarded from previous handlers via `next(err)`
  const catchError: ErrorRequestHandler = (err, req, res, next) => {
    ctx.log.error(err)
    if (!res.headersSent) {
      http.internalServerError(res, next)
    }
  }
  app.use(catchError)

  // Add request logging middleware
  app.use((req, res, next) => {
    ctx.log.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.url} ${res.statusCode}`)
    next()
  })

  return app
}

const index: RequestHandler = (req, res, next) => {
  res.send({
    product: 'Herda Server',
    version,
  })
  next()
}

export default createExpress
