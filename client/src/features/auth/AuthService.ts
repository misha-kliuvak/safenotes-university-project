import Cookies from 'js-cookie'

const COOKIE_ACCESS_TOKEN_KEY = 'u_enc_t'

export class AuthService {
  public static saveAuthToken (token: string) {
    Cookies.set(COOKIE_ACCESS_TOKEN_KEY, token)
  }

  public static getAuthToken () {
    return Cookies.get(COOKIE_ACCESS_TOKEN_KEY)
  }

  public static removeAuthToken () {
    return Cookies.remove(COOKIE_ACCESS_TOKEN_KEY)
  }
}
