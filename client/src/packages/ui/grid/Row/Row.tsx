import clsx from 'clsx'
import React, { CSSProperties, FC, PropsWithChildren, ReactNode } from 'react'
import { IFlexProps } from '../types'

import styles from './Row.module.scss'

interface IRowProps extends Omit<IFlexProps, 'direction'> {
  children?: ReactNode
  className?: string
}

const Row: FC<PropsWithChildren<IRowProps>> = ({
  justify = 'start',
  items = 'start',
  reverse = false,
  gap = 0,
  className,
  onClick,
  children
}: IRowProps) => (
  <div
    style={{ '--gap': `${gap}px` } as CSSProperties}
    className={clsx(
      styles.row,
      styles[`justify-${justify}`],
      styles[`align-${items}`],
      reverse && styles.reverse,
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
)

export default Row
