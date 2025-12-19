import { AxiosProgressEvent } from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { Dictionary } from '@/common/types'
import { IRequestError } from './types'

export function getErrorMessage (error: IRequestError) {
  return Array.isArray(error.message) ? error.message[0] : error.message
}

/**
 * Create string with query params based on object, example:
 * { token: [token] }
 * return a string 'https://.....?token=[token]
 * @param url
 * @param queries
 */
export function withQuery (url: string, queries: Record<string, string>) {
  const queryArr = Object.keys(queries)
    .map((key) => `${key}=${queries[key]}`)

  const queryString = queryArr.join('&')

  return `${url}?${queryString}`
}

/**
 * Format string to url with params, example::
 * rnd/:id -> rnd/1
 * @param endpoint
 * @param params object with params, url should contain keys from object
 */
export function withParams (endpoint: string, params: Dictionary<string>) {
  let urlWithPatchedParams = endpoint

  Object.keys(params)
    .forEach((key: string) => {
      if (urlWithPatchedParams.includes(key)) {
        urlWithPatchedParams = urlWithPatchedParams.replace(
          `:${key}`,
          params[key]
        )
      }
    })

  return urlWithPatchedParams
}

export function buildUploadProgressEvent<T> (
  fileId: string,
  setProgressInfo: Dispatch<SetStateAction<T>>
) {
  return (event: AxiosProgressEvent) => {
    const {
      loaded,
      total
    } = event
    const percent = total ? Math.floor((loaded * 100) / total) : 0

    setProgressInfo((prevProgressInfo: T) => ({
      ...prevProgressInfo,
      [fileId]: {
        percent,
        showUploadProgress: percent !== 100
      }
    }))
  }
}

export function downloadPdfFile (
  blobResponse: BlobPart,
  fileName = 'unnamed-file'
) {
  const blob = new Blob([blobResponse], { type: 'application/pdf' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${fileName}.pdf`
  link.click()
  URL.revokeObjectURL(link.href)
}
