import { NavigateFunction, useNavigate } from 'react-router-dom'
import ROUTES from '@/router/routes'

class Navigator {
  navigate: NavigateFunction

  constructor(navigate: NavigateFunction) {
    this.navigate = navigate
  }

  public to = (path: string) => {
    this.navigate(path)
  }

  public goBack = () => {
    this.navigate(-1)
  }

  public toLogin = () => {
    this.navigate(ROUTES.LOGIN)
  }

  public toDashboard = () => {
    this.navigate(ROUTES.DASHBOARD)
  }
}

export function useNavigator() {
  const navigate = useNavigate()

  return new Navigator(navigate)
}
