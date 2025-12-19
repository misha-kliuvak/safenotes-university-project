import { FC, useEffect } from 'react'
import { FullScreenLoading } from '@/packages/ui'
import { useNavigator } from '@/router/Navigator'
import { StoreType, withStore } from '@/common/store'

const mapStateToProps = ({ auth }: StoreType) => ({
  isLoggedIn: auth.isLoggedIn,
  loading: auth.loading
})

type RouterDispatcherProps = ReturnType<typeof mapStateToProps>

const RouterDispatcher: FC<RouterDispatcherProps> = ({
  isLoggedIn,
  loading
}: RouterDispatcherProps) => {
  const navigate = useNavigator()

  useEffect(() => {
    if (loading) return

    console.log('hjere')
    if (isLoggedIn) {
      navigate.toDashboard()
    } else {
      navigate.toLogin()
    }
  }, [isLoggedIn, loading])

  return <FullScreenLoading solidColor loading />
}

export default withStore(mapStateToProps)(RouterDispatcher)
