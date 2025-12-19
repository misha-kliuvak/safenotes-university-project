import React, { forwardRef, ForwardRefRenderFunction, useCallback } from 'react'
import {
  NumberFormatValues,
  PatternFormat,
  NumberFormatBase,
  PatternFormatProps,
  SourceInfo
} from 'react-number-format'
import { ChangeEvent } from '@/common/types'
import { IInputProps, OnInputValueChange } from './types'
import Input from './Input'

type MaskInputProps = IInputProps &
  Pick<
    PatternFormatProps,
    'format' | 'mask' | 'allowEmptyFormatting' | 'patternChar'
  > & {
    onValueChange?: OnInputValueChange
    asNumberFormat?: boolean
  }

const MaskInput: ForwardRefRenderFunction<HTMLInputElement, MaskInputProps> = (
  props,
  ref
) => {
  const {
    format,
    mask,
    allowEmptyFormatting,
    patternChar,
    onValueChange,
    asNumberFormat = false,
    ...rest
  } = props

  const handleOnValueChange = (
    values: NumberFormatValues,
    { event }: SourceInfo
  ) => {
    if (!event) return

    onValueChange?.(values, event as ChangeEvent)
  }

  const Component = asNumberFormat ? NumberFormatBase : PatternFormat

  const CustomComponent = useCallback(
    (inputProps: any) => (
      <Component
        {...inputProps}
        ref={ref}
        format={format}
        mask={mask}
        allowEmptyFormatting={allowEmptyFormatting}
        patternChar={patternChar}
        onValueChange={handleOnValueChange}
      />
    ),
    [props]
  )

  return (
    <Input {...rest} useCustomComponent customComponent={CustomComponent} />
  )
}

export default forwardRef(MaskInput)
