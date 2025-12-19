import React from 'react'
import { MenuIcons } from '@/features/dashboard/assets/icons/MenuIcons'
import { StaticIcons } from '@/assets/icons'
import { ROUTES } from '@/router'
import { Spacer } from '@/packages/ui'

import menu from '@/features/dashboard/menu'

import MenuItem from './MenuItem/MenuItem'
import styles from './NavigationMenu.module.scss'

const NavigationMenu = () => (
    <aside className={styles.sidebar}>
      <StaticIcons.WhiteLogo className={styles.logo} />
      <Spacer size={40} />
      <Spacer size={30} />

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menu.map((route) => (
            <MenuItem
              key={route.title + route.to}
              title={route.title}
              to={route.to}
              icon={route.icon}
            />
          ))}
          <MenuItem
            className="tw-mt-auto"
            title="Logout"
            to={ROUTES.LOGOUT}
            icon={MenuIcons.Logout}
          />
        </ul>
      </nav>
    </aside>
  )

export default NavigationMenu
