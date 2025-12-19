import React from 'react'

import { textControl } from '@/common/storybook/argTypes'
import { TStoryWithText } from '@/common/storybook/types'

import ButtonComponent, { IButtonProps } from './Button'

export default {
  component: ButtonComponent,
  title: 'Buttons'
}

type TStoryProps = TStoryWithText<IButtonProps>

export const Button = ({ text, ...restArgs }: TStoryProps): JSX.Element => (
  <div className="tw-w-[250px]">
    <ButtonComponent {...restArgs}>{text}</ButtonComponent>
  </div>
)

Button.args = {
  text: 'Welcome'
}

Button.argTypes = { text: textControl }
