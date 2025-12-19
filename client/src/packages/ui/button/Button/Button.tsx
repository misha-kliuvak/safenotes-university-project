import clsx from 'clsx'
import { noop } from 'lodash'
import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState
} from 'react'
import styles from './Button.module.scss'

export interface IButtonProps {
  type?: 'button' | 'submit' | 'reset'
  element?: 'button' | 'a'
  appearance?: 'primary' | 'secondary' | 'ordinary' | 'link'
  width?: 'default' | 'full' | 'fit'
  disabled?: boolean
  href?: string // used only with appearance === link
  children?: ReactNode
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  loading?: boolean
  uppercase?: boolean
  className?: string
  addon?: ReactNode
}

const Button: FC<PropsWithChildren<IButtonProps>> = ({
  type = 'button',
  element = 'button',
  appearance = 'primary',
  width = 'full',
  disabled: btnDisabled = false,
  loading = false,
  href = '#',
  onClick,
  className = '',
  addon,
  uppercase,
  children
}: IButtonProps) => {
  const [disabled, setDisabled] = useState<boolean>(false)

  useEffect(() => {
    setDisabled(btnDisabled || loading)
  }, [btnDisabled, loading])

  const commonStyles = clsx(
    width && styles[`button-w-${width}`],
    disabled && styles.disabled,
    uppercase && styles.uppercase
  )

  if (element === 'a') {
    return (
      <a
        href={href}
        className={clsx(
          commonStyles,
          styles.buttonLink,
          styles[`button-${appearance}`],
          className
        )}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={clsx(
        commonStyles,
        styles.button,
        styles[`button-${appearance}`],
        className
      )}
      disabled={disabled}
      onClick={addon ? noop : onClick}
    >
      <span className={styles.buttonText} onClick={addon ? onClick : noop}>
        {loading ? 'Loading...' : children}
      </span>

      {!!addon && addon}
    </button>
  )
}

export default React.memo(Button)
