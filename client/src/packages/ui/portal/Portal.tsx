import { ReactNode, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

function createWrapperAndAppendToBody (wrapperId: string) {
  const wrapperElement = document.createElement('div')
  wrapperElement.setAttribute('id', wrapperId)
  document.body.appendChild(wrapperElement)
  return wrapperElement
}

interface IProps {
  children?: ReactNode
  wrapperId: string
}

const Portal = (props: IProps) => {
  const {
    children,
    wrapperId = 'react-portal-wrapper'
  } = props
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let element = document.getElementById(wrapperId)
    let systemCreated = false

    if (!element) {
      systemCreated = true
      element = createWrapperAndAppendToBody(wrapperId)
    }
    setWrapperElement(element)

    return () => {
      if (systemCreated && element?.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [wrapperId])

  if (wrapperElement === null) return null

  return createPortal(children, wrapperElement)
}

export default Portal
