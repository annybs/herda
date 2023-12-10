import type { ProviderProps} from 'react'
import { createContext, createElement, useEffect, useState } from 'react'

export interface DocumentProps {
  titleSuffix: string
}

export interface DocumentState {
  clearTitle(): void
  setTitle(title: string): void
}

export const DocumentContext = createContext({} as DocumentState)

export function DocumentProvider({ children, value: params }: ProviderProps<DocumentProps>) {
  const [title, setTitle] = useState<string>()

  function clearTitle() {
    setTitle(undefined)
  }

  useEffect(() => {
    if (title) {
      document.title = `${title} - ${params.titleSuffix}`
    } else {
      document.title = params.titleSuffix
    }
  }, [params.titleSuffix, title])

  const value = { clearTitle, setTitle }

  return createElement(DocumentContext.Provider, { value }, children)
}
