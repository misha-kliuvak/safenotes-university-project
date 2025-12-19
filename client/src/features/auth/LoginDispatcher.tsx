import { FC, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { FullScreenLoading } from '@/packages/ui'
import { ROUTES, useNavigator } from '@/router'

const redirectPaths = [ROUTES.LOGIN, ROUTES.SIGN_UP]

interface LoginDispatcherProps {
  isLoggedIn: boolean
  autoLogin: (accessToken?: string | null) => void
  loading: boolean
}

const LoginDispatcher: FC<LoginDispatcherProps> = ({
  isLoggedIn,
  autoLogin,
  loading
}: LoginDispatcherProps) => {
  const location = useLocation()
  const navigate = useNavigator()
  const [searchParams] = useSearchParams()
  const accessToken = searchParams.get('accessToken')

  useEffect(() => {
    autoLogin(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (isLoggedIn && redirectPaths.includes(location.pathname)) {
      navigate.toDashboard()
    }
  }, [isLoggedIn, location])

  if (loading) {
    return <FullScreenLoading loading solidColor />
  }

  return <></>
}

export default LoginDispatcher
