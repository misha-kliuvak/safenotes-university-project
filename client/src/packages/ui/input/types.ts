import { ChangeEvent, PropsWithRef, ReactNode } from 'react'
import { NumberFormatValues } from 'react-number-format'

export interface IInputProps
  extends PropsWithRef<JSX.IntrinsicElements['input']> {
  label?: string
  invalid?: boolean
  addonAfter?: string | ReactNode
  addonBefore?: string | ReactNode
  containerClassName?: string
}

export type OnInputValueChange = (
  values: NumberFormatValues,
  event: ChangeEvent<HTMLInputElement>
) => void
