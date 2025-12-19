import clsx from 'clsx'
import React, { FC, FunctionComponent } from 'react'
import { ConditionalRender } from '@/common/components'
import { IconProps } from '@/common/hocs'
import { Color, TextColor } from '@/packages/pallete'
import { NavLink, Spacer, Text, TextTypes } from '@/packages/ui'

import styles from './MenuItem.module.scss'

interface MenuItemProps {
  title: string
  to: string
  icon?: FunctionComponent<IconProps>
  className?: string
}

const MenuItem: FC<MenuItemProps> = ({
  title,
  to,
  icon: Icon,
  className
}: MenuItemProps) => (
  <li className={clsx(styles.menuItem, className)}>
    <NavLink href={to} className={styles.link}>
      <div className={styles.icon}>
        <ConditionalRender condition={!!Icon}>
          {Icon?.({
            size: 18,
            color: TextColor(Color.neutral0)
          })}
        </ConditionalRender>
      </div>
      <Spacer size={12} vertical />
      <Text
        type={TextTypes.BODY_SMALL}
        color={TextColor(Color.neutral0)}
        className={styles.title}
      >
        {title}
      </Text>
    </NavLink>
  </li>
)

export default MenuItem
