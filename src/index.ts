import { main } from './main'

main({
  http: {
    host: process.env.HTTP_HOST || '',
    port: parseInt(process.env.HTTP_PORT || '5001'),
  },
}).catch(err => {
  if (err) console.error(err)
})
