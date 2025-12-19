import React, { FC, useCallback } from 'react'

import { FontWeight, Text, TextTypes } from '@/packages/ui'
import { ChangeEvent } from '@/common/types'

import styles from './Switch.module.scss'

export interface ISwitchProps {
  name: string
  label?: string // possible add label if it needs
  checked?: boolean
  onChange?: (value: boolean) => void
}

const Switch: FC<ISwitchProps> = ({
  onChange,
  label,
  ...rest
}: ISwitchProps) => {
  const handleChange = useCallback((event: ChangeEvent) => {
    onChange?.(event.target.checked)
  }, [])

  return (
    <div className={styles.container}>
      {!!label && (
        <Text type={TextTypes.BODY_SMALL} weight={FontWeight.MEDIUM}>
          {label}
        </Text>
      )}
      <label className={styles.wrapper}>
        <input
          className={styles.switch}
          type="checkbox"
          onChange={handleChange}
          {...rest}
        />

        <span className={styles.slider} />
      </label>
    </div>
  )
}

export default Switch
