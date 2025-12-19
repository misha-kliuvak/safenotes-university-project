import React, { FC } from 'react'

import { ReactComponent as GoogleIcon } from './icons/google.svg'
import { ReactComponent as LinkedInIcon } from './icons/linkedin.svg'

import styles from './OAuthButton.module.scss'

interface IProps {
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  type: 'linkedin' | 'google'
}

const iconMap = {
  'linkedin': LinkedInIcon,
  'google': GoogleIcon
}

const OAuthButton: FC<IProps> = ({
  onClick,
  type
}: IProps) => {
  const Icon = iconMap[type]

  return (
    <button className={styles.buttonGoogle} onClick={onClick}>
      <Icon />
    </button>
  )
}

export default OAuthButton
