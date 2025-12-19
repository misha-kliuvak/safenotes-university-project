import { AuthStore } from '@/features/auth'

class RootStore {
  auth: AuthStore

  constructor () {
    this.auth = new AuthStore(this)
  }
}

export default RootStore
