import React, { forwardRef, ForwardRefRenderFunction, useCallback } from 'react'
import {
  NumberFormatBase,
  NumberFormatValues,
  SourceInfo
} from 'react-number-format'
import { ChangeEvent } from '@/common/types'
import { IInputProps, OnInputValueChange } from './types'
import Input from './Input'

type NumberInputProps = Omit<IInputProps, 'type'> & {
  onValueChange?: OnInputValueChange
}

const format = (value: string) => {
  if (value === '') return ''

  let month = value.substring(0, 2)
  const year = value.substring(2, 4)

  if (month.length === 1 && +month[0] > 1) {
    month = `0${month[0]}`
  } else if (month.length === 2) {
    // set the lower and upper boundary
    if (Number(month) === 0) {
      month = '01'
    } else if (Number(month) > 12) {
      month = '12'
    }
  }

  return `${month}/${year}`
}

const NumberInput: ForwardRefRenderFunction<
  HTMLInputElement,
  NumberInputProps
> = (props, ref) => {
  const { onValueChange, ...rest } = props

  const handleOnValueChange = (
    values: NumberFormatValues,
    { event }: SourceInfo
  ) => {
    if (!event) return

    onValueChange?.(values, event as ChangeEvent)
  }

  const CustomComponent = useCallback(
    (inputProps: any) => (
      <NumberFormatBase
        {...inputProps}
        ref={ref}
        format={format}
        onValueChange={handleOnValueChange}
      />
    ),
    [props, format]
  )

  return (
    <Input {...rest} useCustomComponent customComponent={CustomComponent} />
  )
}

export default forwardRef(NumberInput)
