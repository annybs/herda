import './Main.scss'
import type { PropsWithChildren } from 'react'

export interface MainProps {
  className?: string
}

export default function Main({ children, className = '' }: PropsWithChildren<MainProps>) {
  return (
    <main className={`main ${className}`}>
      {children}
    </main>
  )
}
