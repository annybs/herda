import './LoadingIndicator.scss'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import type { PropsWithChildren } from 'react'

export default function LoadingIndicator({ children }: PropsWithChildren) {
  return (
    <div className="loading-indicator">
      <ArrowPathIcon />
      <slot>
        {children || <span>Loading</span>}
      </slot>
    </div>
  )
}
