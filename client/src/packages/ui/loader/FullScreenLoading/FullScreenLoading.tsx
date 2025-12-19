import clsx from 'clsx'
import React, { FC, useEffect } from 'react'
import { useLockedBody } from 'usehooks-ts'
import { Portal } from '../../portal'
import { Loader } from '../Loader'
import styles from './FullScreenLoading.module.scss'

interface FullScreenLoadingProps {
  solidColor?: boolean
  loading?: boolean
}

const FullScreenLoading: FC<FullScreenLoadingProps> = ({
  solidColor,
  loading
}: FullScreenLoadingProps) => {
  const [, setLocked] = useLockedBody(false, 'root')

  useEffect(() => {
    setLocked(!!loading)

    if (!loading) {
      setTimeout(() => {
        setLocked(false)
      }, 1000)
    }
  }, [loading])

  if (!loading) return <></>

  return (
    <Portal wrapperId="fullscreen-loading">
      <div className={clsx(styles.container, solidColor && styles.solidColor)}>
        <Loader size={20} color="white" loading />
      </div>
    </Portal>
  )
}

export default FullScreenLoading
