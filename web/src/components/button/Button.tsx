import './Button.scss'
import type { ReactElement } from 'react'
import { useState } from 'react'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  confirm?: ReactElement
}

/**
 * General-purpose button component.
 * Provides base styling, which can be augmented with standard class names:
 *
 * ```jsx
 * <Button className="fill mini negative outline positive wide">My Button</Button>
 * ```
 */
export default function Button({ children, className = '', confirm, onClick, type: typ, ...props }: PropsWithChildren<ButtonProps>) {
  const [intent, setIntent] = useState(false)

  const click: typeof onClick = e => {
    if (confirm && !intent) {
      setIntent(true)
      return
    }
    onClick?.(e)
  }

  function mouseLeave() {
    setIntent(false)
  }

  return (
    <button
      className={`button ${className}`}
      onClick={click}
      onMouseLeave={mouseLeave}
      type={typ || 'button'}
      {...props}
    >
      {intent && confirm ? confirm : children}
    </button>
  )
}
