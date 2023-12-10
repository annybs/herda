import './Notice.scss'
import type { PropsWithChildren } from 'react'
import type { RequestError } from '@/api'

export interface NoticeProps {
  className?: string
  error?: Error
}

export default function Notice({ className = '', error, ...props }: PropsWithChildren<NoticeProps>) {
  if (error?.name === 'RequestError') {
    let message = ''
    const re = error as RequestError
    if (re.data) {
      if (re.data.param && re.data.reason) message = `Error in ${re.data.param}: ${re.data.reason}`
      else if (re.data.reason) message = `Error: ${re.data.reason}`
    } else message = `Error: ${re.message}`

    return (
      <div className={`notice ${className} error api-error`}>
        <span>{message}</span>
      </div>
    )
  }

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
