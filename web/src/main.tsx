import './index.scss'
import { ConnectionProvider } from './providers/connection'
import { DocumentProvider } from './providers/document'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SessionProvider } from './providers/session'
import build from './build'
import { localValueStorage } from './lib/valueStorage'
import routes from './routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

const connectionProps = {
  host: build.api.host,
  timeout: build.api.timeout,
}

const documentProps = {
  titleSuffix: build.document.titleSuffix,
}

const router = createBrowserRouter(routes)

const sessionProps = {
  authStorage: localValueStorage(`${build.localStorage.prefix}auth`),
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DocumentProvider value={documentProps}>
      <ConnectionProvider value={connectionProps}>
        <SessionProvider value={sessionProps}>
          <RouterProvider router={router} />
        </SessionProvider>
      </ConnectionProvider>
    </DocumentProvider>
  </React.StrictMode>,
)
