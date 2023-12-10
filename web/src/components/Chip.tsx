import './Chip.scss'
import type { FieldError } from 'react-hook-form'
import type { PropsWithChildren } from 'react'

export interface ChipProps {
  className?: string
  error?: Error | FieldError
}

export default function Chip({ className = '', error, ...props }: PropsWithChildren<ChipProps>) {
  if (error) return (
    <span className={`chip negative ${className}`}>
      {error.message || 'Invalid value'}
    </span>
  )

  return props.children && (
    <span className={`chip ${className}`}>
      {props.children}
    </span>
  )
}
