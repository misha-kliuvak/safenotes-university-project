import { FC, useCallback } from 'react'
import clsx from 'clsx'

import { ChangeEvent } from '@/common/types'

import styles from './SwitchLarge.module.scss'

export interface ISwitchProps {
  name: string
  isOn?: boolean
  onChange?: (value: boolean) => void
  textOn?: string
  textOff?: string
}

// TODO SHIT man, there is already same switches,
//  just different styles and props, why don't be better to use regular Switch
//  with some type of customization, or extend this switch from previous
//  just note to not forget to refactor it
const SwitchLarge: FC<ISwitchProps> = ({
  onChange,
  name,
  isOn = false,
  textOn = 'On',
  textOff = 'Off'
}: ISwitchProps) => {
  const handleChange = useCallback((event: ChangeEvent) => {
    onChange?.(event.target.checked)
  }, [])

  return (
    <div className={styles.container}>
      <label className={styles.switchLarge}>
        <input
          checked={isOn}
          onChange={handleChange}
          name={name}
          className={styles.switchLarge_checkbox}
          type="checkbox"
        />
        <div className={styles.switchLarge_button} />
        <div
          className={clsx(styles.switchLarge_labels, isOn && styles.checked)}
        >
          <span>{textOff}</span>
          <span>{textOn}</span>
        </div>
      </label>
    </div>
  )
}

export default SwitchLarge
