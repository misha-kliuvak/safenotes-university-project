import React, { FC, ReactNode } from 'react'
import { NavigationMenu } from '@/features/dashboard'

import styles from './DashboardLayout.module.scss'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout: FC<DashboardLayoutProps> = ({
  children
}: DashboardLayoutProps) => (
  <div className={styles.container}>
    <NavigationMenu />
    <div className={styles.content}>{children}</div>
  </div>
)

export default DashboardLayout
