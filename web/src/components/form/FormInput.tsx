import './FormInput.scss'
import type { PropsWithChildren } from 'react'

export interface FormInputProps {
  className?: string
  id?: string
  label?: string
}

export default function FormInput({ className = '', id, label, ...props }: PropsWithChildren<FormInputProps>) {
  return (
    <section className={`input ${className}`}>
      {label && (
        <label htmlFor={id}>{label}</label>
      )}
      {props.children}
    </section>
  )
}
