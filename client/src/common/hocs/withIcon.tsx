import clsx from 'clsx'
import React, { FC } from 'react'
import { Color } from '@/packages/pallete'
import { ClickEvent } from '@/common/types'

export const XMLNS = 'http://www.w3.org/2000/svg'

export interface IconProps {
  onClick?: ClickEvent<Element>
  className?: string
  width?: number
  height?: number
  size?: number
  color?: Color
  clickable?: boolean
}

export function withIcon<T extends IconProps>(
  WrappedComponent: React.ComponentType<T>
): FC {
  const displayName: string =
    WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'

  const ComponentWrapped: FC<IconProps> = ({
    className,
    onClick,
    color,
    width,
    height,
    size,
    clickable = true,
    ...rest
  }: IconProps) => {
    const $width = width ?? size
    const $height = height ?? size
    return (
      <WrappedComponent
        className={clsx(clickable && 'l-icon', color, className)}
        onClick={onClick}
        style={{
          width: $width,
          height: $height,
          minWidth: $width,
          minHeight: $height
        }}
        xmlns={XMLNS}
        {...(rest as T)}
      />
    )
  }

  ComponentWrapped.displayName = `withIcon(${displayName})`

  return ComponentWrapped
}

export default withIcon
