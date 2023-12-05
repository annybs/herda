import type { SignalConstants } from 'os'
import { createExpress } from './http'
import createLogger from './log'
import process from 'process'
import type { Config, Context } from './types'

/**
 * Server application entrypoint.
 */
async function main(config: Config): Promise<void> {
  // Create context
  const ctx = <Context>{ config }

  // Initialize logger
  ctx.log = createLogger(ctx)

  // Initialize Express app
  const app = createExpress(ctx)

  // Start processes.
  // This promise can only be rejected, signifying that the app has stopped
  return new Promise((res, rej) => {
    // Start HTTP server
    const server = app.listen(config.http.port, config.http.host)

    // Shut down on interrupt or terminate
    async function stop(e: keyof SignalConstants) {
      await Promise.all([
        // Stop server
        new Promise<void>((res, rej) => {
          server.close(err => {
            if (err) {
              ctx.log.error(err)
              rej(err)
            } else {
              ctx.log.info('Stopped HTTP server')
              res()
            }
          })
        }),
      ])

      ctx.log.error(`Received ${e}`)
      rej()
    }
    process.on('SIGINT', e => stop(e).catch(rej))
    process.on('SIGTERM', e => stop(e).catch(rej))
  })
}

export default main
