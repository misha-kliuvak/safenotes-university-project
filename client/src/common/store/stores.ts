import RootStore from './RootStore'

export const stores = new RootStore()

export type StoreType = typeof stores
export type RootStoreType = RootStore
