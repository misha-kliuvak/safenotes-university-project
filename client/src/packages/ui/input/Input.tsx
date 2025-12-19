import clsx from 'clsx'
import {
  ForwardedRef,
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  Ref,
  WheelEvent
} from 'react'
import { IInputProps } from './types'
import { Label } from '../label'
import { Spacer } from '../spacer'

import styles from './style.module.scss'

interface IProps {
  type?: string
  addonBefore?: ReactNode
  addonAfter?: ReactNode
  containerClassName?: string
  useCustomComponent?: boolean
  customComponent?: (inputProps: any) => ReactNode
}

const Input: ForwardRefRenderFunction<HTMLInputElement,
  IProps & IInputProps> = (
  {
    type = 'text',
    addonBefore,
    addonAfter,
    name,
    label,
    value,
    invalid,
    useCustomComponent,
    customComponent,
    className,
    containerClassName,
    ...rest
  }: IProps & IInputProps,
  ref: Ref<HTMLInputElement> | ForwardedRef<HTMLInputElement>
) => {
  const hasData = Boolean(value)

  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  const inputProps = {
    id: name,
    type,
    name,
    value,
    onWheel: handleWheel,
    className: clsx(
      styles.input,
      hasData && styles.hasData,
      invalid && styles.invalid,
      Boolean(addonBefore) && styles.withAddonBefore,
      Boolean(addonAfter) && styles.x,
      className
    ),
    ...rest
  }

  return (
    <div className={clsx(styles.container, rest.disabled && styles.disabled)}>

      {Boolean(label) &&
        <>
          <Label htmlFor={name} label={label} />
          <Spacer size={8} />
        </>
      }

      <div className={clsx(
        styles.wrapper,
        containerClassName && containerClassName
      )}
      >
        {Boolean(addonBefore) && <div className={styles.addonBefore}>{addonBefore}</div>}

        {Boolean(useCustomComponent)
          ? customComponent?.(inputProps)
          : <input ref={ref} {...inputProps} />
        }

        {Boolean(addonAfter) && <div className={styles.addonAfter}>{addonAfter}</div>}
      </div>
    </div>
  )
}

export default forwardRef(Input)
