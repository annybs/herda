import Button from './Button'
import type { ButtonProps } from './Button'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import type { PropsWithChildren } from 'react'

export default function SaveButton({ className = '', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <Button className={`save positive ${className}`} {...props}>
      <CheckCircleIcon />
      {props.children ? props.children : <span>Save</span>}
    </Button>
  )
}
