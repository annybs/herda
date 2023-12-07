import Button from './Button'
import { type ButtonProps } from './Button'
import type { PropsWithChildren } from 'react'
import { TrashIcon } from '@heroicons/react/20/solid'

export default function DeleteButton({ className = '', confirm, ...props }: PropsWithChildren<ButtonProps>) {
  const _confirm = confirm || (
    <>
      <TrashIcon />
      <span>Really delete?</span>
    </>
  )

  return (
    <Button className={`delete negative ${className}`} confirm={_confirm} {...props}>
      <TrashIcon />
      {props.children ? props.children : <span>Delete</span>}
    </Button>
  )
}
