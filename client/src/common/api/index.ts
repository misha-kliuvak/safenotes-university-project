import axios from 'axios'

import { registerInterceptors } from '@/common/api/interceptors'
import config from '@/config'

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
})

registerInterceptors(api)

export default api
