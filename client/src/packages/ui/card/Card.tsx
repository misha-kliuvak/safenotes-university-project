import clsx from 'clsx'
import React, { CSSProperties, FC, PropsWithChildren } from 'react'

import styles from './Card.module.scss'

type CardProps = PropsWithChildren<{
  paddingVertical?: number
  paddingHorizontal?: number
  padding?: number
  className?: string
}>

const Card: FC<CardProps> = ({
  paddingHorizontal,
  paddingVertical,
  padding,
  className,
  children
}: CardProps) => {
  const paddingX = padding || paddingHorizontal || 20
  const paddingY = padding || paddingVertical || 20
  return (
    <div
      className={clsx(styles.card, className)}
      style={
        {
          '--paddingX': `${paddingX}px`,
          '--paddingY': `${paddingY}px`
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

export default Card
