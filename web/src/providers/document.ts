import { useConfig } from '@/hooks'
import type { ProviderProps} from 'react'
import { createContext, createElement, useEffect, useState } from 'react'

export interface DocumentState {
  clearTitle(): void
  setTitle(title: string): void
}

export const DocumentContext = createContext({} as DocumentState)

export function DocumentProvider({ children }: ProviderProps<undefined>) {
  const { config } = useConfig()

  const [title, setTitle] = useState<string>()

  function clearTitle() {
    setTitle(undefined)
  }

  useEffect(() => {
    if (title) {
      document.title = `${title} - ${config.document.titleSuffix}`
    } else {
      document.title = config.document.titleSuffix
    }
  }, [config.document.titleSuffix, title])

  const value = { clearTitle, setTitle }

  return createElement(DocumentContext.Provider, { value }, children)
}
