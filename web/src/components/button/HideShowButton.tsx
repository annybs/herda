import Button from './Button'
import type { ButtonProps } from './Button'
import type { PropsWithChildren } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid'

export interface HideShowButtonProps extends ButtonProps {
  visible: boolean
}

export default function HideShowButton({ className = '', visible, ...props }: PropsWithChildren<HideShowButtonProps>) {
  if (visible) return (
    <Button className={`hide-show ${className}`} {...props}>
      <EyeSlashIcon />
      {props.children ? props.children : <span>Hide</span>}
    </Button>
  )

  return (
    <Button className={`hide-show ${className}`} {...props}>
      <EyeIcon />
      {props.children ? props.children : <span>Show</span>}
    </Button>
  )
}
