import * as api from '@/api'
import build from '@/build'
import deepmerge from 'deepmerge'
import type { ProviderProps } from 'react'
import { createContext, createElement, useEffect, useState } from 'react'

export interface ConfigProps {
  defaults: typeof build
  path: string
}

export interface ConfigState {
  config: typeof build
  ready: boolean
}

export const ConfigContext = createContext({} as ConfigState)

export function ConfigProvider({ children, value: params }: ProviderProps<ConfigProps>) {
  const [config, setConfig] = useState(build)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.request<typeof build>({ host: `//${document.location.host}` }, 'GET', params.path)
      .then(res => {
        setConfig(deepmerge(build, res))
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setReady(true)
      })
  }, [])

  const value = { config, ready }

  return createElement(ConfigContext.Provider, { value }, children)
}
