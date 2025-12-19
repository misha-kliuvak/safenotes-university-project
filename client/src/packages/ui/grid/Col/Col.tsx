import clsx from 'clsx'
import React, { FC, PropsWithChildren } from 'react'
import { Row } from '@/packages/ui'
import { IRowColProps } from '../types'

import styles from './Col.module.scss'

type IColProps = IRowColProps

const Col: FC<PropsWithChildren<IColProps>> = ({
  className,
  children,
  reverse,
  ...rest
}: IColProps) => (
  <Row
    className={clsx(styles.column, reverse && styles.reverse, className)}
    {...rest}
  >
    {children}
  </Row>
)

export default Col
