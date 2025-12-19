import { ROUTES } from '@/router'
import { MenuIcons } from './assets/icons/MenuIcons'

const menu = [
  {
    icon: MenuIcons.Home,
    title: 'Home',
    to: ROUTES.DASHBOARD
  },
  {
    icon: MenuIcons.MySafes,
    title: 'My SAFEs',
    to: ROUTES.DASHBOARD
  },
  {
    icon: MenuIcons.RequestSafe,
    title: 'Request SAFE',
    to: ROUTES.DASHBOARD
  },
  {
    icon: MenuIcons.Investment,
    title: 'Make Investments',
    to: ROUTES.DASHBOARD
  }
]

export default menu
