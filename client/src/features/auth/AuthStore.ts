import { action, observable, runInAction } from 'mobx'
import { clearPersistedStore, makePersistable } from 'mobx-persist-store'
import { IRequestError } from '@/common/api/types'
import { RootStore, StoreHandler } from '@/common/store'
import { TFailedFields } from '@/common/types'
import { AuthRequests } from '@/features/auth/api/requests'
import {
  AuthResponse,
  LoginDto,
  SignUpDto,
  ValidateTokenResponse
} from '@/features/auth/api/types'
import { AuthType } from '@/features/auth/enums'
import { AuthService } from './AuthService'

export class AuthStore extends StoreHandler {
  @observable failedFields: TFailedFields = {}

  @observable isLoggedIn = false

  constructor(rootStore: RootStore) {
    super(rootStore)
    makePersistable(this, {
      name: 'AuthStore',
      properties: ['isLoggedIn'],
      storage: window.sessionStorage
    })
  }

  @action
  private auth = this.execute(
    async (type: AuthType, data: LoginDto | SignUpDto) => {
      try {
        const isLogin = type === AuthType.Login

        const response: AuthResponse = isLogin
          ? await AuthRequests.login(data)
          : await AuthRequests.signUp(data as SignUpDto)

        if (response) {
          AuthService.saveAuthToken(response.accessToken)
          // await this.rootStore.user.fetchMe()

          runInAction(() => {
            this.isLoggedIn = true
          })
        }
      } catch (error) {
        this.failedFields = (error as IRequestError).failedFields || {}
      }
    },
    'auth'
  )

  public clearErrors = () => {
    this.failedFields = {}
  }

  @action
  public signUp = this.execute(async (body: SignUpDto) => {
    await this.auth(AuthType.SignUp, body)
  }, 'signUp')

  @action
  public login = this.execute(async (data: LoginDto) => {
    await this.auth(AuthType.Login, data)
  }, 'login')

  @action
  public autoLogin = this.execute(async (accessToken?: string | null) => {
    if (accessToken) {
      AuthService.saveAuthToken(accessToken)
    }

    const token = AuthService.getAuthToken()

    if (token) {
      try {
        const validateTokenResponse: ValidateTokenResponse =
          await AuthRequests.validateToken(token)
        const isLoggedIn = validateTokenResponse.valid
        if (isLoggedIn) {
          // TODO fetch user
          // await this.rootStore.user.fetchMe()
        }
        runInAction(() => {
          this.isLoggedIn = isLoggedIn
        })
      } catch (err) {
        this.isLoggedIn = false
        await clearPersistedStore(this)
      }
      return
    }

    this.isLoggedIn = false
    await clearPersistedStore(this)
  }, 'autoLogin')

  @action
  public logout = this.execute(async () => {
    AuthService.removeAuthToken()
    runInAction(() => {
      this.isLoggedIn = false
      // this.rootStore.user.clearUser()
    })
  }, 'logout')
}
