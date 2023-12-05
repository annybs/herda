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
}).catch(err => {
  if (err) console.error(err)
})
