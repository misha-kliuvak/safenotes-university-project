import {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  Ref,
  useEffect,
  useState
} from 'react'
import Input from './Input'

import { IInputProps } from './types'
import { isDateFormatValid } from './utils'

interface IDatePickerInput {
  addonBefore?: ReactNode
  addonAfter?: ReactNode
  onSelectInput?: () => void
  onChangeDate?: (event: string) => void
}

const DatePickerInput: ForwardRefRenderFunction<HTMLInputElement,
  IInputProps & IDatePickerInput> = (props: IInputProps & IDatePickerInput, ref: Ref<HTMLInputElement>) => {
  const {
    addonBefore,
    addonAfter,
    value,
    onSelectInput,
    onChangeDate,
    ...rest
  } = props

  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const $value = event.target.value
    setInputValue($value)
    if (onChangeDate && isDateFormatValid($value, 'MMM d,yyyy')) {
      onChangeDate($value)
    }
  }

  return (
    <Input value={inputValue} onClick={onSelectInput} onChange={handleChange} ref={ref}
           {...rest} addonBefore={addonBefore} addonAfter={addonAfter}
    />
  )
}

export default forwardRef(DatePickerInput)
