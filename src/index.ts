import crypto from 'crypto'
import dotenv from 'dotenv'
import main from './main'

dotenv.config()

/**
 * Some configuration may be dynamically generated at startup.
 * This private object allows it to be preserved during the application's runtime.
 */
const dynamicConfig: Record<string, unknown> = {}

/** String truthy values. */
const TRUE = ['1', 't', 'y', 'on', 'yes', 'true']

// Run the app
main({
  api: {
    prefix: process.env.API_PREFIX || '/api',
  },
  auth: {
    jwt: {
      expiresIn: parseInt(process.env.AUTH_JWT_EXPIRES_IN || '86400'),
      get secret() {
        if (process.env.AUTH_JWT_SECRET) return process.env.AUTH_JWT_SECRET
        if (!dynamicConfig.authJwtSecret) {
          const secret = crypto.randomBytes(64).toString('hex')
          console.warn('AUTH_JWT_SECRET not set. Generated a JWT secret for this run only:', secret)
          dynamicConfig.authJwtSecret = secret
        }
        return dynamicConfig.authJwtSecret as string
      },
    },
  },
  http: {
    host: process.env.HTTP_HOST || '',
    port: parseInt(process.env.HTTP_PORT || '5001'),
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
  mongo: {
    db: process.env.MONGO_DB || 'herda',
    uri: process.env.MONGO_URI || 'mongodb://root:root@localhost:27017',
    useTransactions: TRUE.includes(process.env.MONGO_USE_TRANSACTIONS || 'false'),
  },
  shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT || '60000'),
}).catch(err => {
  if (err) console.error(err)
  process.exit(1)
})
