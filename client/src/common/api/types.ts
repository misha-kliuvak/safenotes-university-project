import { AxiosProgressEvent } from 'axios'

export interface IRequestError {
  statusCode: number
  message: string | string[]
  error: boolean
  failedFields?: {
    [key: string]: string[]
  }
}

export type TUploadProgressEvent = (event: AxiosProgressEvent) => void
