import api from '@/common/api'
import { withQuery } from '@/common/api/helpers'
import {
  AuthResponse,
  LoginDto,
  SignUpDto,
  ValidateTokenResponse
} from './types'

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGN_UP: '/auth/registration',
  VALIDATE_TOKEN: '/auth/validate-token'
}

export class AuthRequests {
  static async login(dto: LoginDto): Promise<AuthResponse> {
    return api.post(AUTH_ENDPOINTS.LOGIN, dto)
  }

  static async signUp(dto: SignUpDto): Promise<AuthResponse> {
    return api.post(AUTH_ENDPOINTS.SIGN_UP, dto)
  }

  static validateToken(token: string): Promise<ValidateTokenResponse> {
    return api.get(withQuery(AUTH_ENDPOINTS.VALIDATE_TOKEN, { token }))
  }
}
