import Button from './Button'
import type { ButtonProps } from './Button'
import type { PropsWithChildren } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

export interface ToggleButtonProps extends ButtonProps {
  toggled?: boolean
}

export default function ToggleButton({ className = '', toggled, ...props }: PropsWithChildren<ToggleButtonProps>) {
  return (
    <Button className={`toggle ${toggled ? 'fill positive' : 'outline negative'} ${className}`} {...props}>
      {toggled ? <CheckCircleIcon /> : <XCircleIcon />}
      {props.children || <span>Toggle</span>}
    </Button>
  )
}
