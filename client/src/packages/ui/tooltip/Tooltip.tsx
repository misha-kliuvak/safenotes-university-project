import Tippy, { TippyProps } from '@tippyjs/react'
import clsx from 'clsx'
import { FC, PropsWithChildren } from 'react'

import 'tippy.js/animations/shift-away-subtle.css'

import styles from './Tooltip.module.scss'

type TooltipProps = PropsWithChildren<Omit<TippyProps, 'children' | 'animation'>>

const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  className,
  ...rest
}: TooltipProps) => {
  const TooltipContent = (
    <div className={clsx(styles.tooltip, className)}>{content}</div>
  )

  return (
    <Tippy
      content={TooltipContent}
      placement={placement}
      animation="shift-away-subtle"
      {...rest}
    >
      {children as JSX.Element}
    </Tippy>
  )
}

export default Tooltip
