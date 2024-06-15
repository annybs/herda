import { ConfigContext } from '@/providers/config'
import { ConnectionContext } from '@/providers/connection'
import { DocumentContext } from '@/providers/document'
import { SessionContext } from '@/providers/session'
import { useContext } from 'react'

export { useRouteSearch } from './routeSearch'

/** Get remote configuration. */
export function useConfig() {
  return useContext(ConfigContext)
}

/**
 * Get the connection to the Herda server.
 * This provides access to request options such as base URL, authentication etc.
 */
export function useConnection() {
  return useContext(ConnectionContext)
}

/**
 * Get functions to modify the document, including setting the page title.
 */
export function useDocument() {
  return useContext(DocumentContext)
}

/**
 * Get the user session, using the connection authentication.
 * This also provides functions to verify and manage the session.
 */
export function useSession() {
  return useContext(SessionContext)
}
