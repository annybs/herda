import type { ProviderProps } from 'react'
import api from '@/api'
import { createContext, createElement, useEffect, useReducer, useState } from 'react'
import { useConfig } from '@/hooks'

/**
 * API connection state.
 */
export interface ConnectionState {
  /** API server availability. */
  available: boolean
  /** API connection error. */
  error: Error | undefined
  /** API server information. */
  info: api.ServerInfo | undefined
  /** API client options. Should be used in all API requests. */
  options: api.Options

  /** Connect to the server and store product information. */
  connect(): Promise<void>
  /** Set the bearer token for use in API requests. Pass undefined to clear the bearer token. */
  setToken(token: string | undefined): void
}

/**
 * Action to mutate API client options.
 */
export type OptionsAction = ['setToken', string | undefined]

/** API client options context. */
export const ConnectionContext = createContext({} as ConnectionState)

/**
 * API connection provider.
 * This should be one of the root components of the application.
 */
export function ConnectionProvider({ children }: ProviderProps<undefined>) {
  const [available, setAvailable] = useState(false)
  const { config } = useConfig()
  const [error, setError] = useState<Error>()
  const [info, setInfo] = useState<api.ServerInfo>()
  const [options, dispatchOptions] = useReducer(OptionsReducer, config.api)

  async function connect() {
    try {
      const res = await api.getServerInfo(options)
      setInfo(res)
      setAvailable(true)
    } catch (err) {
      setError(err as Error)
      setAvailable(false)
    }
  }

  function setToken(token: string | undefined) {
    return dispatchOptions(['setToken', token])
  }

  useEffect(() => {
    connect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    available, error, info, options,
    connect, setToken,
  }
  return createElement(ConnectionContext.Provider, { value }, children)
}

/** API client options reducer. */
function OptionsReducer(state: api.Options, [task, data]: OptionsAction) {
  if (task === 'setToken') {
    state.token = data
    return state
  }
  throw new Error('Invalid OptionsAction')
}
