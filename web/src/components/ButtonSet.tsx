import './ButtonSet.scss'
import type { PropsWithChildren } from 'react'

export interface ButtonSetProps {
  className?: string
}

export default function ButtonSet({ className = '', ...props }: PropsWithChildren<ButtonSetProps>) {
  return (
    <div className={`button-set ${className}`}>
      {props.children}
    </div>
  )
}
