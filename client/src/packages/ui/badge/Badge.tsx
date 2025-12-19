import clsx from 'clsx'
import React, { FC, ReactNode } from 'react'
import { ConditionalRender } from '@/common/components'
import { BADGE_TYPE } from '@/packages/ui'

import styles from './Badge.module.scss'

interface BadgeProps {
  type?: BADGE_TYPE | null
  text: string
  icon?: ReactNode
  noBackground?: boolean
}

const Badge: FC<BadgeProps> = ({
  type = BADGE_TYPE.SUCCESS,
  text,
  icon,
  noBackground
}: BadgeProps) => (
  <div
    className={clsx(
      styles.container,
      type && styles[`type-${type}`],
      noBackground && styles.noBackground
    )}
  >
    <div className={styles.status}>{text}</div>
    <ConditionalRender condition={!!icon}>
      <div className={styles.icon}>{icon}</div>
    </ConditionalRender>
  </div>
)

export default Badge
