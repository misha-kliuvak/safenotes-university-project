import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useRef
} from 'react'

import { StoreType } from './stores'

type MapperType<T> = (store: StoreType) => T

export const StoreContext = createContext<StoreType | object>({})

export const StoreProvider = (props: PropsWithChildren): JSX.Element => {
  const { children, ...stores } = props
  const parentValue = useContext(StoreContext)
  const mutableProviderRef = useRef({ ...parentValue, ...stores })
  const value = mutableProviderRef.current

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore<T>(mapper: MapperType<T>): T {
  const stores = useContext(StoreContext)

  if (!stores) {
    throw new Error('Store has not been initialized')
  }

  return mapper(stores as StoreType)
}
