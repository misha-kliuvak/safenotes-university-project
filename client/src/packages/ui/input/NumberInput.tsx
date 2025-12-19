import React, {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useCallback
} from 'react'
import {
  NumberFormatValues,
  NumericFormat,
  NumericFormatProps,
  SourceInfo
} from 'react-number-format'
import { IInputProps, OnInputValueChange } from './types'
import Input from './Input'

type NumberInputProps = Omit<IInputProps, 'type'> &
  Pick<
    NumericFormatProps,
    | 'suffix'
    | 'prefix'
    | 'thousandSeparator'
    | 'decimalSeparator'
    | 'maxLength'
    | 'decimalScale'
  > & {
    onValueChange?: OnInputValueChange
  }

const NumberInput: ForwardRefRenderFunction<
  HTMLInputElement,
  NumberInputProps
> = (props, ref) => {
  const {
    prefix,
    suffix,
    decimalScale,
    thousandSeparator = ',',
    decimalSeparator = '.',
    maxLength,
    onValueChange,
    ...rest
  } = props

  const handleOnValueChange = (
    values: NumberFormatValues,
    { event }: SourceInfo
  ) => {
    if (!event) return

    onValueChange?.(values, event as ChangeEvent<HTMLInputElement>)
  }

  const CustomComponent = useCallback(
    (inputProps: any) => (
      <NumericFormat
        {...inputProps}
        ref={ref}
        suffix={suffix}
        prefix={prefix}
        maxLength={maxLength}
        allowLeadingZeros
        getInputRef={ref}
        decimalScale={decimalScale}
        thousandSeparator={thousandSeparator}
        decimalSeparator={decimalSeparator}
        onValueChange={handleOnValueChange}
      />
    ),
    [props]
  )

  return (
    <Input {...rest} useCustomComponent customComponent={CustomComponent} />
  )
}

export default forwardRef(NumberInput)
