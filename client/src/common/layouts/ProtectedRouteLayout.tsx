import React, { FC, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import debounce from 'lodash/debounce'
import { ConditionalRender } from '@/common/components'
import { FullScreenLoading } from '@/packages/ui'
import { useNavigator } from '@/router'

export interface ProtectedRouteLayoutProps {
  isLoggedIn: boolean
}

const ProtectedRouteLayout: FC<ProtectedRouteLayoutProps> = ({
  isLoggedIn
}): JSX.Element => {
  const navigate = useNavigator()

  useEffect(() => {
    const debouncedFunction = debounce(() => {
      if (!isLoggedIn) {
        navigate.toLogin()
      }
    }, 1000)

    debouncedFunction()

    return () => {
      debouncedFunction.cancel()
    }
  }, [isLoggedIn])

  return (
    <ConditionalRender
      condition={isLoggedIn}
      fallbackElement={<FullScreenLoading loading solidColor />}
    >
      <Outlet />
    </ConditionalRender>
  )
}

export default ProtectedRouteLayout
