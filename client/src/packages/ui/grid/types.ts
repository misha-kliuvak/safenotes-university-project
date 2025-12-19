import { ReactNode } from 'react'

export interface IFlexProps {
  justify?: 'between' | 'center' | 'start' | 'end' | 'around' | 'evenly'
  items?: 'start' | 'end' | 'baseline' | 'center' | 'stretch'
  reverse?: boolean
  gap?: number // in px
  onClick?: () => void
}

export interface IRowColProps extends IFlexProps {
  children?: ReactNode
  className?: string
}
