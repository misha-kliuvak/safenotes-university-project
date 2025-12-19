import clsx from 'clsx'
import React, { CSSProperties, FC } from 'react'
import { SyncLoader } from 'react-spinners'
import { LoaderSizeMarginProps } from 'react-spinners/helpers/props'
import styles from './Loader.module.scss'

interface LoaderProps extends Omit<LoaderSizeMarginProps, 'color'> {
  color?: 'primary' | 'secondary' | 'white'
  width?: string
  height?: string
  className?: string
  style?: CSSProperties
}

const colorsMatcher = {
  primary: styles.primary,
  secondary: styles.secondary,
  white: styles.white
}

const Loader: FC<LoaderProps> = ({
  color = 'primary',
  width,
  height = '100%',
  className,
  style,
  ...props
}: LoaderProps) => (
  <div
    className={clsx(styles.loader, className)}
    style={{ width, height, ...style }}
  >
    <SyncLoader color={colorsMatcher[color]} {...props} />
  </div>
)

export default Loader
