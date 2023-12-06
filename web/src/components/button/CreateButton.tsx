import Button from './Button'
import type { ButtonProps } from './Button'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import type { PropsWithChildren } from 'react'

export default function CreateButton({ className = '', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <Button className={`create positive ${className}`} {...props}>
      <PlusCircleIcon />
      {props.children ? props.children : <span>Create</span>}
    </Button>
  )
}
