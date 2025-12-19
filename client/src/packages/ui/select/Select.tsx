import clsx from 'clsx'
import { FC, memo, useMemo, useState } from 'react'
import { ConditionalRender } from '@/common/components'

import { Spacer, Text, TextTypes } from '@/packages/ui'
import { Label } from '../label'
import { Dropdown } from '../dropdown'
import styles from './Select.module.scss'

interface ISelectProps {
  value?: string | undefined
  // todo
  options: any[]
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  fullWidth?: boolean
  label?: string
  small?: boolean
  placeholder?: string
}

const SelectComponent: FC<ISelectProps> = (props: ISelectProps) => {
  const {
    value,
    disabled,
    fullWidth,
    className,
    options,
    onChange,
    label,
    small,
    placeholder = 'Select...'
  } = props
  const [open, setOpen] = useState<boolean>(false)

  const valueLabel = useMemo(
    () => options.find((option: any) => option.id === value)?.label,
    [JSON.stringify(options), value]
  )

  const handleOptionClick = (_id: string): void => {
    onChange?.(_id)
  }

  return (
    <div
      className={clsx(
        disabled && 'disabled-element',
        fullWidth && styles.fullWidth,
        className
      )}
    >
      <ConditionalRender condition={!!label}>
        <Label label={label} />
        <Spacer size={8} />
      </ConditionalRender>

      <Dropdown
        options={options}
        setOpen={setOpen}
        onItemClick={handleOptionClick}
        selectedOption={value}
        disabled={disabled}
      >
        <div
          className={clsx(
            styles.selectContainer,
            fullWidth && styles.fullWidth
          )}
        >
          <div className={clsx(styles.select, small && styles.small)}>
            <Text type={TextTypes.BODY_SMALL}>{valueLabel || placeholder}</Text>
            {/* <Icons.ArrowDown className={clsx(open && styles.rotate)} /> */}
          </div>
        </div>
      </Dropdown>
    </div>
  )
}

export const Select = memo<ISelectProps>(SelectComponent)
