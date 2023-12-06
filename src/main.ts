import type { SignalConstants } from 'os'
import createAuth from './auth'
import createDatabase from './db'
import createExpress from './http'
import createLogger from './log'
import process from 'process'
import type { Config, Context } from './types'

/** Server application entrypoint. */
async function main(config: Config): Promise<void> {
  // Create context
  const ctx = <Context>{ config }
  ctx.ctx = () => ctx

  // Initialize logger
  const log = createLogger(ctx)
  ctx.log = log

  // Initialize auth
  const auth = createAuth(ctx)
  ctx.auth = auth

  // Initialize database connection
  const { mongo, db, model } = await createDatabase(ctx)
  ctx.mongo = mongo
  ctx.db = db
  ctx.model = model
  log.info('Connected to MongoDB', config.mongo)

  // Initialize Express app
  const app = createExpress(ctx)

  // Start processes.
  // This promise can only be rejected, signifying that the app has stopped
  log.info('Starting app')
  return new Promise((res, rej) => {
    // Start HTTP server
    const server = app.listen(config.http.port, config.http.host)
    log.info('Listening for HTTP connections', config.http)

    // Shutdown function
    async function stop(e?: keyof SignalConstants) {
      // Force shutdown if any task hangs
      const t = setTimeout(() => {
        rej(new Error(`Waited ${config.shutdownTimeout}ms to shut down, forcing exit`))
      }, config.shutdownTimeout)

      await Promise.all([
        // Close database connection
        (async (): Promise<void> => {
          try {
            await mongo.close()
            log.info('Closed MongoDB connection')
          } catch (err) {
            log.error('Failed to close MongoDB connection', err)
          }
        })(),
        // Stop HTTP server
        new Promise<void>((res, rej) => {
          server.close(err => {
            if (err) {
              log.error('Failed to stop HTTP server', err)
              rej(err)
            } else {
              log.info('Stopped HTTP server')
              res()
            }
          })
        }),
      ])
      clearTimeout(t)

      if (e) log.error(`Received ${e}`)
      rej()
    }

    // Shut down on interrupt or terminate
    process.on('SIGINT', e => stop(e).catch(rej))
    process.on('SIGTERM', e => stop(e).catch(rej))
  })
}

export default main
