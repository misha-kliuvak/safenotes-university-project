import { FC, PropsWithChildren, ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useLockedBody } from 'usehooks-ts'

import { ConditionalRender, Portal } from '@/common/components'
import { Icons } from '@/packages/icons'

import styles from './Modal.module.scss'

export interface IModalBase {
  visible?: boolean | null
}

export interface IModalWithSetVisible extends IModalBase {
  setVisible?: (open: boolean) => void
}

export interface IModalWithCloseFn extends IModalBase {
  closeModal?: () => void
}

interface IModal extends IModalWithSetVisible {
  id: string
  closeIcon?: boolean
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Modal: FC<PropsWithChildren<IModal>> = ({
  id,
  visible = false,
  setVisible,
  closeIcon = false,
  children,
  size = 'md',
  className
}: IModal) => {
  const onClose = () => setVisible?.(false)

  const [, setLocked] = useLockedBody(false, 'root')

  useEffect(() => {
    setLocked(!!visible)

    if (!visible) {
      setTimeout(() => {
        setLocked(false)
      }, 1000)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <Portal wrapperId={id}>
          <motion.div
            className={clsx(styles.modalFramer)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeInOut'
              }
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut'
            }}
          >
            <div id={id} className={clsx(styles.modal)}>
              <div
                id={`${id}-modal-body`}
                onClick={(e) => e.stopPropagation()}
                className={clsx(
                  styles.modalBody,
                  size && styles[`modalBody-${size}`],
                  'custom-scroll',
                  className
                )}
              >
                <ConditionalRender condition={closeIcon}>
                  <div className={styles.header}>
                    <Icons.Cross
                      onClick={onClose}
                      className={styles.closeIcon}
                    />
                  </div>
                </ConditionalRender>
                <div>{children}</div>
              </div>
            </div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  )
}
