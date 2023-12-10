import AppLayout from './layouts/AppLayout'
import Authenticated from './components/Authenticated'
import ErrorView from './views/ErrorView'
import HerdListView from '@/views/HerdListView'
import HerdView from './views/HerdView'
import LoginView from './views/LoginView'
import { Outlet } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import CreateAccountView from './views/CreateAccountView'
import AccountSettingsView from './views/AccountSettingsView'

const coreRoutes: RouteObject[] = [
  {
    path: '',
    element: <HerdListView />,
  },
  {
    path: '/account/settings',
    element: <AccountSettingsView />,
  },
  {
    path: '/herd/:id',
    element: <HerdView />,
  },
]

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Authenticated>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </Authenticated>
    ),
    errorElement: (
      <AppLayout>
        <ErrorView />
      </AppLayout>
    ),
    children: [
      ...coreRoutes,
    ],
  },
  {
    path: '/login',
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    errorElement: (
      <AppLayout>
        <ErrorView />
      </AppLayout>
    ),
    children: [
      {
        path: '',
        element: <LoginView />,
      },
    ],
  },
  {
    path: '/account/create',
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    errorElement: (
      <AppLayout>
        <ErrorView />
      </AppLayout>
    ),
    children: [
      {
        path: '',
        element: <CreateAccountView />,
      },
    ],
  },
]

export default routes
