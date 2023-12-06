import { ArrowUturnDownIcon } from '@heroicons/react/20/solid'
import Button from './Button'
import type { ButtonProps } from './Button'
import type { PropsWithChildren } from 'react'

export default function ResetButton({ className = '', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <Button className={`reset ${className}`} {...props}>
      <ArrowUturnDownIcon />
      {props.children ? props.children : <span>Reset</span>}
    </Button>
  )
}
