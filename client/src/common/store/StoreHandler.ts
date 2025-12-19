import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { getErrorMessage } from '@/common/api/helpers'
import { ToastService } from '@/common/services'
import RootStore from './RootStore'

type Executable<T> = (...args: any[]) => Promise<T | null>

type ExecuteOptions = {
  showToastOnError?: boolean
  loaderName?: string
  manuallyControlLoader?: boolean
}

class StoreHandler {
  rootStore: RootStore

  @observable private $loading: Record<string, boolean> = {}

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeObservable(this)
  }

  @computed
  get loading(): boolean {
    return Object.values(this.$loading).some((loading) => loading)
  }

  @computed
  get functionLoading(): Record<string, boolean> {
    // return the loading state for each function
    return this.$loading
  }

  @action
  public setLoading = (loaderName: string, loading: boolean) => {
    runInAction(() => {
      this.$loading[loaderName] = loading
    })
  }

  execute<T>(
    executable: Executable<T>,
    optionsOrLoaderName?: string | ExecuteOptions
  ) {
    const options: ExecuteOptions =
      typeof optionsOrLoaderName === 'object' ? optionsOrLoaderName : {}

    const {
      showToastOnError = true,
      loaderName: optionsLoaderName,
      manuallyControlLoader
    } = options

    const $loaderName: string =
      typeof optionsOrLoaderName === 'string'
        ? (optionsOrLoaderName as string)
        : optionsLoaderName || 'global'

    return async (...args: any[]) => {
      if (!manuallyControlLoader) {
        this.setLoading($loaderName, true)
      }

      try {
        await executable(...args)
      } catch (error: any) {
        const errorMessage: string = getErrorMessage(error) || 'Client error'

        if (showToastOnError) {
          ToastService.showWarning(errorMessage.toString())
        }

        if (error.statusCode === 401) {
          await this.rootStore.auth.logout()
        }

        throw new Error(error)
      } finally {
        if (!manuallyControlLoader) {
          this.setLoading($loaderName, false)
        }
      }
    }
  }
}

export default StoreHandler
