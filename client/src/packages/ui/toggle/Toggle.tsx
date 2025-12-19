import React, { FC, ChangeEvent, ReactNode, memo } from 'react'
import clsx from 'clsx'

import { Icons } from '@/packages/icons'
import { Tooltip } from '@/packages/ui'

import styles from './Toggle.module.scss'

interface IProps {
  disabled?: boolean
  value: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  withWarningTooltip?: string
  warningTooltipContent?: ReactNode
}

// TODO just curious what's the different between this one and Switch component
// eslint-disable-next-line react/display-name
export const Toggle: FC<IProps> = memo((props: IProps) => {
  const {
    disabled,
    value,
    withWarningTooltip,
    warningTooltipContent,
    onChange
  } = props

  return (
    <div className={clsx(styles.toggleContainer, disabled && styles.disabled)}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={value}
          disabled={disabled}
          onChange={onChange}
          className={styles.toggleCheckbox}
        />
        <div className={styles.toggleSwitch} />
      </label>
      {withWarningTooltip && !value && (
        <Tooltip placement="right" content={warningTooltipContent}>
          <Icons.Warning />
        </Tooltip>
      )}
    </div>
  )
})
