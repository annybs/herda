import './Placeholder.scss'
import type { PropsWithChildren } from 'react'

export interface PlaceholderProps {
  className?: string
}

export default function Placeholder({ children, className = '' }: PropsWithChildren<PlaceholderProps>) {
  return (
    <div className={`placeholder ${className}`}>
      {children}
    </div>
  )
}
