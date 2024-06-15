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
import { ConfigProvider } from './providers/config'
import AwaitConfig from './components/AwaitConfig'

const configProps = {
  defaults: build,
  path: '/config.json'
}

const router = createBrowserRouter(routes)

const sessionProps = {
  authStorage: localValueStorage(`${build.localStorage.prefix}auth`),
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider value={configProps}>
      <AwaitConfig>
        <DocumentProvider value={undefined}>
          <ConnectionProvider value={undefined}>
            <SessionProvider value={sessionProps}>
              <RouterProvider router={router} />
            </SessionProvider>
          </ConnectionProvider>
        </DocumentProvider>
      </AwaitConfig>
    </ConfigProvider>
  </React.StrictMode>,
)
