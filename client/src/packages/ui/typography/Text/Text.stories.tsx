import React from 'react'

import { TStoryWithText } from '@/packages/ui/types'
import { textControl } from '@/packages/ui/argTypes'

import TextComponent, { ITextProps } from './Text'

export default {
  component: TextComponent,
  title: 'Typography'
}

type TStoryProps = TStoryWithText<ITextProps>

export const Text = ({ text, ...rest }: TStoryProps): JSX.Element => (
  <TextComponent {...rest}>{text}</TextComponent>
)

Text.args = {
  text: 'Lorem ipsum dolor sit amet'
}

Text.argTypes = {
  text: textControl
}
