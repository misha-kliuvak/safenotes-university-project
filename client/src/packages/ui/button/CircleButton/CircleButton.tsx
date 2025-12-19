import clsx from 'clsx'
import { noop } from 'lodash'
import React, { FC, PropsWithChildren } from 'react'
import { ClickEvent } from '@/common/types'

import styles from './CirlceButton.module.scss'

interface Props {
  onClick?: ClickEvent<HTMLDivElement>
  className?: string
}

const CircleButton: FC<PropsWithChildren<Props>> = ({
  onClick = noop,
  className,
  children
}) => (
  <div className={clsx(styles.container, className)} onClick={onClick}>
    {children}
  </div>
)

export default CircleButton
