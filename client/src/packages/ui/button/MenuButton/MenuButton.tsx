import clsx from 'clsx'
import React, { FC, PropsWithChildren, useState } from 'react'
import { TOption } from '@/packages/ui/types'
// import { Dropdown } from '@/common/components'
// import { Icons } from '@/packages/icons'
import { Button, IButtonProps } from '../Button'
import styles from './MenuButton.module.scss'

interface IMenuButtonProps extends PropsWithChildren<IButtonProps> {
  options: TOption[]
  onItemClick?: (id: string, option: TOption) => void
  menuDisabled?: boolean
}

const MenuButton: FC<IMenuButtonProps> = ({
  children,
  options = [],
  onItemClick,
  menuDisabled,
  ...props
}) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <Button
        {...props} className={clsx(styles.menuButton, props.disabled && styles.disabled)}
        // addon={
        //   <Dropdown
        //     placement="top-end"
        //     options={options}
        //     onItemClick={onItemClick}
        //     disabled={menuDisabled}
        //     setOpen={setOpen}
        //   >
        //     <span
        //       className={clsx(
        //         styles.menuIconWrapper,
        //         menuDisabled && styles.disabled,
        //         open && styles.menuOpen
        //       )}
        //     >
        //       <Icons.ArrowDown
        //         color={TEXT_COLORS.neutral50}
        //         className={clsx(styles.menuIcon)}
        //         size={10}
        //       />
        //     </span>
        //   </Dropdown>
        // }
      >
        {children}
      </Button>
    </>
  )
}

export default MenuButton
