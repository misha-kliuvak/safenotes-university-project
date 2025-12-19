import React, { ForwardedRef, forwardRef, ForwardRefRenderFunction } from 'react'
import { useToggle } from '@/packages/hooks'
import Input from './Input'

import { IInputProps } from './types'

const PasswordInput: ForwardRefRenderFunction<HTMLInputElement, IInputProps> = (
  props: IInputProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const [passwordVisible, toggleEye] = useToggle(false)

  return (
    <Input ref={ref}
           {...props} type={passwordVisible ? 'text' : 'password'}
    />
    // addonAfter={conditionalRender(
    //   passwordVisible,
    //   <Icons.CrossedEye className={styles.eye} onClick={toggleEye} />,
    //   <Icons.Eye className={styles.eye} onClick={toggleEye} />
    // )} />
  )
}

export default forwardRef(PasswordInput)
