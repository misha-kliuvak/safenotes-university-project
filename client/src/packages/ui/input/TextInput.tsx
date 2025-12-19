import React, {
  ForwardedRef,
  forwardRef,
  ForwardRefRenderFunction
} from 'react'

import Input from './Input'
import { IInputProps } from './types'

const TextInput: ForwardRefRenderFunction<HTMLInputElement, IInputProps> = (
  props: IInputProps,
  ref: ForwardedRef<HTMLInputElement>
) => <Input ref={ref} {...props} />

export default forwardRef(TextInput)
