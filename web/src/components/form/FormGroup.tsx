import './FormGroup.scss'
import type { PropsWithChildren } from 'react'

export interface FormGroupProps {
  className?: string
  name?: string
}

export default function FormGroup({ className = '', name, ...props }: PropsWithChildren<FormGroupProps>) {
  return (
    <fieldset className={`fieldset ${className}`}>
      {name && <legend>{name}</legend>}
      {props.children}
    </fieldset>
  )
}
