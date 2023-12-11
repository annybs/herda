import './FormToggle.scss'
import type { HTMLAttributes } from 'react'

export interface FormToggleProps extends HTMLAttributes<HTMLInputElement> {
  checked?: boolean
  label: string
}

export default function FormToggle({ className = '', id, label, ...props }: FormToggleProps) {
  return (
    <section className={`toggle ${className}`}>
      <div className="checkbox">
        <input type="checkbox" id={id} {...props} />
      </div>
      <label htmlFor={id}>{label}</label>
    </section>
  )
}
