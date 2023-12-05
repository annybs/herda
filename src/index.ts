import main from './main'

main({
  api: {
    prefix: process.env.API_PREFIX || '/api',
  },
  http: {
    host: process.env.HTTP_HOST || '',
    port: parseInt(process.env.HTTP_PORT || '5001'),
  },
}).catch(err => {
  if (err) console.error(err)
})
