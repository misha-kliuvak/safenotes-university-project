import React, { FC, PropsWithChildren, ReactNode } from 'react'

import styles from './styles.module.scss'

interface IProps {
  gap?: number
  children?: ReactNode
  onSubmit?: () => void
}

export const Form: FC<PropsWithChildren<IProps>> = ({
  gap = 20,
  onSubmit,
  children
}: IProps) => (
  <form
    className={styles.form}
    style={{ '--row-gap': `${gap}px` } as React.CSSProperties}
    onSubmit={onSubmit}
  >
    {children}
  </form>
)
