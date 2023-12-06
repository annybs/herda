import type { ProviderProps } from 'react'
import type { ValueStorage } from '@/lib/valueStorage'
import api from '@/api'
import { useConnection } from '@/hooks'
import { createContext, createElement, useLayoutEffect, useState } from 'react'

export interface SessionData {
  account?: api.Account
  loggedIn?: boolean
  ready?: boolean
}

export interface SessionProps {
  authStorage: ValueStorage<api.LoginAccountResponse>
}

export interface SessionState extends SessionData {
  heartbeat(): Promise<void>
  login(email: string, password: string): Promise<void>
  logout(): void
}

export function SessionProvider({ children, value: { authStorage } }: ProviderProps<SessionProps>) {
  const { options, setToken } = useConnection()

  const [account, setAccount] = useState<api.Account>()
  const [loggedIn, setLoggedIn] = useState(false)
  const [ready, setReady] = useState(false)

  function reset() {
    authStorage.del()
    setAccount(undefined)
    setToken(undefined)
    setLoggedIn(false)
  }

  async function heartbeat(token?: string) {
    try {
      const res = await api.getAccount({ ...options, token })
      setAccount(res.account)
      setToken(token)
      setLoggedIn(true)
    } catch (err) {
      const status = (err as api.RequestError).xhr?.status || 500
      // If the response code indicates a client-side issue, reset session state
      if (status >= 400 && status < 500) {
        reset()
      }
      throw err
    }
  }

  async function login(email: string, password: string) {
    const res = await api.loginAccount(options, {
      account: { email, password },
    })

    authStorage.set(res)

    setAccount(res.account)
    setToken(res.token)
    setLoggedIn(true)
  }

  function logout() {
    reset()
  }

  // Check whether a session exists in storage, and if so, send a heartbeat.
  // This effect triggers once only when the component is mounted.
  useLayoutEffect(() => {
    if (!ready) {
      const auth = authStorage.get()
      if (auth?.token) {
        heartbeat(auth.token)
          .catch(err => {
            console.log(err)
          })
          .finally(() => {
            setReady(true)
          })
      } else setReady(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    account, loggedIn, ready,
    heartbeat, login, logout,
  }

  return createElement(SessionContext.Provider, { value }, children)
}

export const SessionContext = createContext({} as SessionState)
