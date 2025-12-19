import React from 'react'

import SwitchComponent, { ISwitchProps } from './Switch'

export default {
  component: SwitchComponent,
  title: 'Switch'
}

export const Default = (props: ISwitchProps): JSX.Element => (
  <SwitchComponent {...props} />
)
