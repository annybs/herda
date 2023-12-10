import './Row.scss'
import type { PropsWithChildren } from 'react'

export interface RowProps {
  className?: string
}

export default function Row({ children, className = '' }: PropsWithChildren<RowProps>) {
  return (
    <div className={`row ${className}`}>
      {children}
    </div>
  )
}
