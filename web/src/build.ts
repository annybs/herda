const build = {
  api: {
    host: import.meta.env.VITE_API_HOST || 'http://localhost:5001/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },
  document: {
    titleSuffix: import.meta.env.VITE_DOCUMENT_TITLE_SUFFIX || 'Herda',
  },
  localStorage: {
    prefix: import.meta.env.VITE_LOCAL_STORAGE_PREFIX || 'herda-',
  },
}

export default build
