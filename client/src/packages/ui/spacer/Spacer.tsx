import clsx from 'clsx'
import React, { CSSProperties, FC } from 'react'

import styles from './Spacer.module.scss'

interface IProps {
  vertical?: boolean
  size: number
  ignoreGridGap?: boolean
}

export const Spacer: FC<IProps> = ({
  vertical = false,
  size,
  ignoreGridGap
}: IProps) => {
  const varName = !vertical ? '--size' : '--v-size'

  return (
    <div
      className={clsx(styles.spacer, vertical && styles.vertical)}
      style={{ [varName]: `${size}px` } as CSSProperties}
      data-ignore-gap={ignoreGridGap}
    />
  )
}
