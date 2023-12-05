import type { Auth } from './auth'
import type { Logger } from './log'
import type { Models } from './db'
import type { Db, MongoClient } from 'mongodb'

/** Application configuration context. */
export interface Config {
  api: {
    /** URL prefix for all APIs (default: "/api") */
    prefix: string
  }
  auth: {
    jwt: {
      /** Expiration time for JWTs (default: 86400 (seconds, or one day)) */
      expiresIn: number
      /**
       * JWT secret for signing and verification.
       * If a value is not set, this is auto generated when the app starts
       */
      secret: string
    }
  }
  http: {
    /** HTTP bind host (default: empty) */
    host: string
    /** HTTP bind port (default: 5001) */
    port: number
  }
  log: {
    /** Log level (default: "info") */
    level: string
  }
  mongo: {
    /** Database to use in MongoDB */
    db: string
    /**
     * MongoDB connection URI.
     *
     * @see https://www.mongodb.com/docs/drivers/node/current/quick-start/create-a-connection-string/
     */
    uri: string
  }
  /**
   * If the application cannot shut down because a process has stalled, it will force shutdown with `process.exit(1)`
   * after this period has elapsed (default: 60000 (milliseconds, or one minute))
   */
  shutdownTimeout: number
}

/**
 * Application context.
 * This is shared throughout the entire codebase, providing access to almost all functionality wherever it's needed.
 */
export interface Context {
  auth: Auth
  config: Config
  db: Db
  log: Logger
  model: Models
  mongo: MongoClient
}
