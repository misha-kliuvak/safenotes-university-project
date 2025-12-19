import clsx from 'clsx'
import React, { FC, ReactNode } from 'react'
import { Text } from '@/packages/ui'
import { TextTypes } from '@/packages/ui/typography'

import styles from './styles.module.scss'

interface IProps {
  children?: ReactNode
  errors?: string | string[] | unknown
  className?: string
}

export const FormItem: FC<IProps> = ({
  children,
  errors,
  className
}: IProps) => {
  const isError = Boolean(
    Array.isArray(errors) ? errors.length >= 1 : errors && errors !== ''
  )

  return (
    <div className={clsx(styles.formItem, className)}>
      {children}
      {isError &&
        <>
          <Text
            type={TextTypes.BODY_SMALL}
            className={styles.error}
          >
            {Array.isArray(errors) ? errors[0] : errors}
          </Text>
        </>}
    </div>
  )
}
