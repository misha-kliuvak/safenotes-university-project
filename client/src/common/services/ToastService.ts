import { toast, ToastContent } from 'react-toastify'
import { ToastOptions } from 'react-toastify/dist/types'

const defaultToastOptions: ToastOptions = {
  toastId: 'MySAFENotesToastId',
  hideProgressBar: true,
  autoClose: 2500
}

export class ToastService {
  static show = (content: ToastContent, options: ToastOptions) => {
    toast(content, {
      ...defaultToastOptions,
      ...options
    })
  }

  static showWarning = (content: ToastContent) => {
    this.show(content, {
      type: 'warning'
    })
  }

  static showInfo = (content: ToastContent) => {
    this.show(content, {
      type: 'info'
    })
  }

  static showSuccess = (content: ToastContent) => {
    this.show(content, {
      type: 'success'
    })
  }
}
