import './Authenticated.scss'
import LoadingIndicator from './LoadingIndicator'
import type { PropsWithChildren } from 'react'
import { useSession } from '@/hooks'
import { Navigate, useLocation } from 'react-router-dom'

export default function Authenticated({ children }: PropsWithChildren) {
  const location = useLocation()
  const session = useSession()

  if (!session.ready) return (
    <div className="authenticating">
      <LoadingIndicator>Checking session</LoadingIndicator>
    </div>
  )

  if (session.loggedIn) return children

  const redirect = location.pathname
  return (
    <Navigate to={{ pathname: '/login', search: `redirect=${redirect}` }} />
  )
}
