export interface LoginDto {
  email: string
  password: string
}

export interface SignUpDto extends LoginDto {
  fullName: string
}

export interface AuthResponse {
  user: any // TODO TEMP
  accessToken: string
}

export interface ValidateTokenResponse {
  valid: boolean
  data: {
    id: string
    email: string
    providers: string[] | null
    iat: number
    exp: number
  }
}
