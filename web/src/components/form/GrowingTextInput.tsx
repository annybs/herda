import './GrowingTextInput.scss'
import { forwardRef } from 'react'
import type { DetailedHTMLProps, KeyboardEvent, TextareaHTMLAttributes } from 'react'

export interface GrowingTextInputProps extends DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {}

const GrowingTextInput = forwardRef<HTMLTextAreaElement, GrowingTextInputProps>((props, ref) => {
  const { className, onInput, ...restProps } = props

  function replicateValue(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.currentTarget.parentElement) {
      e.currentTarget.parentElement.dataset.replicatedValue = e.currentTarget.value
    }

    onInput?.(e)
  }

  return (
    <div className={`growing-text-input ${className}`}>
      <textarea {...restProps} onInput={replicateValue} ref={ref} />
    </div>
  )
})

export default GrowingTextInput
