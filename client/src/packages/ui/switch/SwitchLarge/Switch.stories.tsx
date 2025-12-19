import React from 'react'

import SwitchComponent, { ISwitchProps } from './SwitchLarge'

export default {
  component: SwitchComponent,
  title: 'Switch'
}

export const Default = (props: ISwitchProps): JSX.Element => (
  <SwitchComponent {...props} />
)
