import Button from './Button'
import type { ButtonProps } from './Button'
import { EyeIcon } from '@heroicons/react/20/solid'
import build from '@/build'
import { useRouteSearch } from '@/hooks'
import type { MouseEvent, PropsWithChildren } from 'react'

export interface LimitButtonProps extends Omit<ButtonProps, 'onClick'> {
  options?: number[]
}

export default function LimitButton({ className = '', options, ...props }: PropsWithChildren<LimitButtonProps>) {
  const routeSearch = useRouteSearch()

  const limits = options || build.button.limit.limits

  const limitIndex = limits.indexOf(routeSearch.limit)
  const nextLimit = limitIndex < 0 || limitIndex === limits.length - 1 ? limits[0] : limits[limitIndex+1]

  function click(e: MouseEvent) {
    e.preventDefault()
    routeSearch.setLimit(nextLimit)
  }

  return (
    <Button className={`limit ${className}`} onClick={click} {...props}>
      <EyeIcon />
      {props.children ? props.children : <span>Show {routeSearch.limit}</span>}
    </Button>
  )
}
