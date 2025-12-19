import { FC } from 'react'
import { ConditionalRender } from '@/common/components'
import LoginDispatcher from '@/features/auth/LoginDispatcher'
import { ToastContainer } from '@/common/containers'
import { StoreType, withStore } from '@/common/store'
import { RootRouter } from './router'

import 'react-toastify/dist/ReactToastify.css'

const mapStateToProps = ({ auth }: StoreType) => ({
  isLoggedIn: auth.isLoggedIn,
  autoLogin: auth.autoLogin,
  autoLoginLoading: auth.functionLoading.autoLogin
})

type AppProps = ReturnType<typeof mapStateToProps>

const App: FC<AppProps> = ({
  isLoggedIn,
  autoLogin,
  autoLoginLoading
}: AppProps) => (
  <>
    <LoginDispatcher
      isLoggedIn={isLoggedIn}
      autoLogin={autoLogin}
      loading={autoLoginLoading}
    />
    <ConditionalRender condition={!autoLoginLoading}>
      <RootRouter isLoggedIn={isLoggedIn} />
    </ConditionalRender>
    <ToastContainer />
  </>
)

export default withStore(mapStateToProps)(App)
