import Button from './Button'
import type { ButtonProps } from './Button'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import type { PropsWithChildren } from 'react'

export default function EditButton({ className = '', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <Button className={`edit ${className}`} {...props}>
      <PencilSquareIcon />
      {props.children ? props.children : <span>Edit</span>}
    </Button>
  )
}
