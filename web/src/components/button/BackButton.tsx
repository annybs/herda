import { ArrowUturnLeftIcon } from '@heroicons/react/20/solid'
import Button from './Button'
import type { ButtonProps } from './Button'
import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ className = '', onClick, ...props }: PropsWithChildren<ButtonProps>) {
  const navigate = useNavigate()

  const click = onClick ? onClick : () => {
    navigate(-1)
  }

  return (
    <Button className={`back ${className}`} onClick={click} {...props}>
      <ArrowUturnLeftIcon />
      {props.children ? props.children : <span>Back</span>}
    </Button>
  )
}
