import './SortableRow.scss'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { CSS } from '@dnd-kit/utilities'
import type { PropsWithChildren } from 'react'
import type { RowProps } from './Row'
import { useSortable } from '@dnd-kit/sortable'

export interface SortableRowProps extends RowProps {
  disabled?: boolean
  id: string
}

export default function SortableRow({ children, className = '', disabled, id }: PropsWithChildren<SortableRowProps>) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div className={`row sortable-row ${className} ${disabled ? 'disabled' : ''}`} style={style} {...attributes}>
      <div className="drag-handle" ref={setNodeRef} {...listeners}>
        <Bars3Icon/>
      </div>
      {children}
    </div>
  )
}
