import dotenv from 'dotenv'
import main from './main'

dotenv.config()

main({
  api: {
    prefix: process.env.API_PREFIX || '/api',
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
  },
  shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT || '60000'),
}).catch(err => {
  if (err) console.error(err)
  process.exit(1)
})
