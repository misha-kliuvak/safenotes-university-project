import React, { FC, ReactNode } from 'react'
import { StaticIcons } from '@/assets/icons'
import {
  FontWeight,
  Heading,
  HeadingTypes,
  Spacer,
  Text,
  TextTypes
} from '@/packages/ui'

import './AuthLayout.scss'

interface AuthLayoutProps {
  title: string
  subtitle: string
  description: string
  children: ReactNode
}

export const AuthLayout: FC<AuthLayoutProps> = ({
  title,
  subtitle,
  description,
  children
}: AuthLayoutProps) => (
  <div className="auth-layout">
    <div className="auth-layout__aside aside">
      <div className="aside__header">
        <StaticIcons.WhiteLogo className="logo" />
      </div>
      <div className="aside__body">
        <Heading weight={FontWeight.BLACK} type={HeadingTypes.H1}>
          {title}
        </Heading>

        <Spacer size={20} />
        <Heading type={HeadingTypes.H2}>{subtitle}</Heading>

        <Spacer size={20} />
        <Text
          className="tw-opacity-80"
          type={TextTypes.BODY_SMALL}
          weight={FontWeight.MEDIUM}
        >
          {description}
        </Text>
      </div>
    </div>
    <div id="auth-layout-content" className="auth-layout__content">
      {children}
    </div>
  </div>
)
