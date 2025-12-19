import { observer } from 'mobx-react-lite'
import { FC, PropsWithChildren } from 'react'
import { RootStoreType, StoreType } from '@/common/store/stores'

import { useStore } from './StoreProvider'

type GetStoreFn<T, S> = (store: RootStoreType, props: S) => T

export function withStore<
  TStoreProps,
  TOwnProps extends PropsWithChildren,
  TProps extends TOwnProps
>(getStoreFn: GetStoreFn<TStoreProps, TOwnProps>): any {
  function Inner(WrappedComponent: FC<TProps & TStoreProps>): FC<TProps> {
    const displayName: string =
      WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'

    const ConnectedWrappedComponent: FC<TProps & TStoreProps> =
      observer(WrappedComponent)

    const ComponentWrapped: FC<TProps> = (props) => {
      const stores = useStore((store: StoreType) => store)

      return (
        <ConnectedWrappedComponent {...props} {...getStoreFn(stores, props)} />
      )
    }

    ComponentWrapped.displayName = `withStore(${displayName})`

    return observer(ComponentWrapped)
  }

  return Inner
}
