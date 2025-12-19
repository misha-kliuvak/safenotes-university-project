import clsx from 'clsx'
import React, { FC, PropsWithChildren, ReactNode } from 'react'

import { FontWeight, HeadingTypes, TextAlign } from '../enums'

import styles from './Heading.module.scss'

export interface IHeadingProps {
  type?: HeadingTypes
  weight?: FontWeight
  align?: TextAlign
  // just a simple class, but for better readability we call it color
  color?: string | string[]
  children?: ReactNode
  className?: string
}

const Heading: FC<PropsWithChildren<IHeadingProps>> = ({
  type = HeadingTypes.H3,
  weight = FontWeight.BOLD,
  align,
  color,
  className,
  children
}: IHeadingProps) => {
  const classes = [className, styles[type], `font-${weight}`]

  if (color && Array.isArray(color)) {
    classes.unshift(...color)
  } else if (color) {
    classes.unshift(color as string)
  }

  if (align) {
    classes.unshift(`tw-text-${align}`)
  }

  return React.createElement(
    type,
    {
      className: clsx(classes)
    },
    children
  )
}

export default Heading
