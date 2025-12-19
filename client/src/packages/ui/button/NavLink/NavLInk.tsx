import React, { FC, ReactNode } from 'react'
import { NavLink as RouterNavLink } from 'react-router-dom'
import clsx from 'clsx'

import styles from './NavLink.module.scss'

export enum NavLinkType {
  PRIMARY = 'primary',
  WHITE = 'white',
  NONE = 'none'
}

interface INavLinkProps {
  type?: NavLinkType
  href?: string
  width?: string
  useActiveState?: boolean
  className?: string
  children?: ReactNode
}

const NavLink: FC<INavLinkProps> = ({
  children,
  href = '#',
  type = NavLinkType.PRIMARY,
  width,
  useActiveState = true,
  className
}: INavLinkProps) => (
  <RouterNavLink
    to={href}
    className={({ isActive }): string | undefined =>
      clsx(
        styles.navLink,
        isActive && useActiveState && styles.active,
        type && styles[`type-${type}`],
        className
      )
    }
    style={{ width }}
  >
    {children}
  </RouterNavLink>
)

export default NavLink
