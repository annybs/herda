import type { SignalConstants } from 'os'
import { createExpress } from './http'
import process from 'process'
import type { Config, Context } from './types'

/**
 * Server application entrypoint.
 */
async function main(config: Config): Promise<void> {
  // Initialize context
  const ctx = <Context>{ config }

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
              console.error(err)
              rej(err)
            } else {
              console.log('Stopped HTTP server')
              res()
            }
          })
        }),
      ])

      rej(new Error(`Received ${e}`))
    }
    process.on('SIGINT', stop)
    process.on('SIGTERM', stop)
  })
}

export default main
