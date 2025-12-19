import React, { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRouteLayout } from '@/common/layouts'
import RouterDispatcher from '@/router/RouterDispatcher'
import ROUTES from '@/router/routes'
import { LoginView, SignUpView } from '@/features/auth'
import { CompanyProfileView } from '@/features/profile'

interface RootRouterProps {
  isLoggedIn: boolean
}

const RootRouter: FC<RootRouterProps> = ({ isLoggedIn }: RootRouterProps) => (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginView />} />
      <Route path={ROUTES.SIGN_UP} element={<SignUpView />} />

      <Route element={<ProtectedRouteLayout isLoggedIn={isLoggedIn} />}>
        <Route path={ROUTES.DASHBOARD} element={<h1>Dashboard</h1>} />
        <Route path={ROUTES.COMPANY_PROFILE} element={<CompanyProfileView />} />
      </Route>

      <Route path="*" element={<RouterDispatcher />} />
    </Routes>
  )

export default RootRouter
