import { AxiosInstance } from 'axios'
import { AuthService } from '@/features/auth'

export function registerInterceptors (axios: AxiosInstance) {
  axios.interceptors.request.use((request: any) => {
    const token = AuthService.getAuthToken()

    if (token && request.headers) {
      request.headers.Authorization = `Bearer ${token}`
      return request
    }
    return request
  })
  axios.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error?.response?.data)
  )
}
