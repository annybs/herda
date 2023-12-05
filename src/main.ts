import { createExpress } from './http'
import process from 'process'
import type { Config, Context } from './types'

/**
 * Server application entrypoint.
 */
async function main(config: Config) {
  // Initialize context
  const ctx = <Context>{ config }

  // Initialize Express app
  const app = createExpress(ctx)

  // Start processes.
  // This promise can only be rejected, signifying that the app has stopped
  return new Promise((res, rej) => {
    // Start HTTP server
    const server = app.listen(config.http.port, config.http.host)

    async function stop() {
      await Promise.allSettled([
        // Stop server
        new Promise<void>((res, rej) => {
          server.close(err => {
            if (err) {
              console.error(err)
              rej(err)
            } else res()
          })
        }),
      ])
    }

    // Shut down on interrupt or terminate
    process.on('SIGINT', async () => {
      await stop()
      rej('Interrupted')
    })
    process.on('SIGTERM', async () => {
      await stop()
      rej('Terminated')
    })
  })
}

export default main
