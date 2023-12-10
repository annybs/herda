import './Notice.scss'
import type { PropsWithChildren } from 'react'

export interface NoticeProps {
  className?: string
  error?: Error
}

export default function Notice({ className = '', error, ...props }: PropsWithChildren<NoticeProps>) {
  if (error) return (
    <div className={`notice ${className} error`}>
      <span>{error.message}</span>
    </div>
  )

  return props.children && (
    <div className={`notice ${className}`}>
      {props.children}
    </div>
  )
}
