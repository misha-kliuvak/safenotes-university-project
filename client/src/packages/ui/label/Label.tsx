import React, { FC, PropsWithChildren } from 'react'
import { FontWeight, Text, TextTypes } from '@/packages/ui'

type LabelProps = {
  label?: string
  htmlFor?: string
  bold?: boolean
  className?: string
  color?: string | string[]
}

const Label: FC<PropsWithChildren<LabelProps>> = ({
  label,
  htmlFor,
  bold = true,
  color,
  children,
  className
}) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
    <Text
      type={TextTypes.BODY_SMALL}
      color={color}
      weight={bold ? FontWeight.SEMIBOLD : FontWeight.REGULAR}
      asSpan
    >
      {label}
    </Text>
  </label>
)

export default Label
