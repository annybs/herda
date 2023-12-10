import { ConnectionContext } from '@/providers/connection'
import { DocumentContext } from '@/providers/document'
import { SessionContext } from '@/providers/session'
import { useContext } from 'react'

export { useRouteSearch } from './routeSearch'

export function useConnection() {
  return useContext(ConnectionContext)
}

export function useDocument() {
  return useContext(DocumentContext)
}

export function useSession() {
  return useContext(SessionContext)
}
