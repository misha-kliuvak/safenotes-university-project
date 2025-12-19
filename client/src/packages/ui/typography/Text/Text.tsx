import clsx from 'clsx'
import { noop } from 'lodash'
import React, { FC, PropsWithChildren, ReactNode } from 'react'
import { Row, Spacer, Tooltip } from '@/packages/ui'

import { FontWeight, TextAlign, TextTypes } from '../enums'

import styles from './Text.module.scss'

export interface ITextProps {
  type?: TextTypes
  weight?: FontWeight
  // just a simple class, but for better readability we call it color
  color?: string | string[]
  align?: TextAlign
  children?: ReactNode
  clickable?: boolean
  tooltip?: string | ReactNode
  // if false, all text become a trigger for tooltip
  // if true then icon appears near the text
  showTooltipTriggerIcon?: boolean
  asSpan?: boolean
  className?: string
  onClick?: () => void
}

const Text: FC<PropsWithChildren<ITextProps>> = ({
  type = TextTypes.BODY_MAIN,
  weight = FontWeight.REGULAR,
  color,
  clickable = false,
  align = TextAlign.LEFT,
  asSpan = false,
  tooltip,
  showTooltipTriggerIcon = false,
  className,
  onClick,
  children
}: ITextProps) => {
  const isBody = type === TextTypes.BODY_MAIN || type === TextTypes.BODY_SMALL

  const baseClasses = [
    styles[type],
    `font-${weight}`,
    `text-${align}`,
    className
  ]

  if (color && Array.isArray(color)) {
    baseClasses.unshift(...color)
  } else if (color) {
    baseClasses.unshift(color as string)
  }

  if (clickable) baseClasses.unshift(styles.clickable)

  const baseProps = {
    className: clsx(baseClasses),
    onClick: clickable ? onClick : noop
  }

  let Component = <span {...baseProps}>{children}</span>

  if (isBody && !asSpan) {
    Component = <p {...baseProps}>{children}</p>
  }

  if (!!tooltip && showTooltipTriggerIcon) {
    return (
      <Row items="center">
        {Component}
        <Spacer size={5} vertical />
        <Tooltip content={tooltip} interactive>
          <span className={styles.flex}>
            {/* <SharedIcons.Info size={15} color={TEXT_COLORS.primary900} /> */}
          </span>
        </Tooltip>
      </Row>
    )
  }

  if (!!tooltip) {
    return (
      <Tooltip content={tooltip} interactive>
        {Component}
      </Tooltip>
    )
  }

  return Component
}

export default Text
