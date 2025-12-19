import Tippy, { TippyProps } from '@tippyjs/react'
import clsx from 'clsx'
import { noop } from 'lodash'
import React, { FC, PropsWithChildren, useRef } from 'react'
import { FontWeight, Text, TextTypes } from '@/packages/ui'
import { TOption } from '@/common/types'
import styles from './Dropdown.module.scss'

import 'tippy.js/animations/shift-away-subtle.css'

interface DropdownProps extends TippyProps {
  options: TOption[]
  onItemClick?: (id: string, option: TOption) => any
  style?: React.CSSProperties
  disabled?: boolean
  setOpen?: (value: boolean) => void
  selectedOption?: string
  dropdownClassName?: string
}

const Dropdown: FC<PropsWithChildren<DropdownProps>> = ({
  onItemClick,
  style,
  options,
  selectedOption,
  placement = 'bottom-end',
  setOpen,
  duration = 500,
  dropdownClassName,
  children,
  ...rest
}: PropsWithChildren<DropdownProps>) => {
  const ref = useRef<any>()

  const handleShow = (instance: unknown) => {
    ref.current = instance
    setOpen?.(true)
  }

  const handleItemClick = (id: string, option: TOption) => {
    onItemClick?.(id, option)
    ref.current?.hide?.()
  }

  const PopupContent = (
    <div className={clsx(styles.dropdown, dropdownClassName)} style={style}>
      {options
        .filter((option: TOption) => !option.hidden)
        .map((option: TOption) => {
          const selected = selectedOption === option.id
          return (
            <div
              key={option.id}
              className={clsx(
                styles.dropdownItem,
                selected && styles.selected,
                option.disabled && styles.disabled
              )}
              onClick={
                !option.disabled
                  ? handleItemClick?.bind(this, option.id, option)
                  : noop
              }
            >
              <Text
                type={TextTypes.CAPTION}
                weight={selected ? FontWeight.BOLD : FontWeight.MEDIUM}
                className={styles.itemText}
              >
                {option.label}
              </Text>
              {option.icon}
            </div>
          )
        })}
    </div>
  )

  const noOptions = options.length === 0

  return (
    <Tippy
      trigger="click"
      placement={placement}
      content={noOptions ? null : PopupContent}
      interactive
      hideOnClick
      animation="shift-away-subtle"
      onShown={handleShow}
      onHide={setOpen?.bind(this, false)}
      appendTo={document.body}
      duration={duration}
      {...rest}
    >
      {children as JSX.Element}
    </Tippy>
  )
}

export default Dropdown
