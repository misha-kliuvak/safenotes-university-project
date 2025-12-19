import React from 'react'

import { TStoryWithText } from '@/packages/ui/types'
import { textControl } from '@/packages/ui/argTypes'
import { HeadingTypes } from '@/packages/ui/typography/enums'

import HeadingComponent, { IHeadingProps } from './Heading'

export default {
  component: HeadingComponent,
  title: 'Typography'
}

type TStoryProps = TStoryWithText<IHeadingProps>

export const Heading = ({
  text,
  ...rest
}: TStoryProps): JSX.Element => (
  <HeadingComponent {...rest}>{text}</HeadingComponent>
)

Heading.args = {
  text: 'Lorem ipsum dolor sit amet',
  type: HeadingTypes.H1
}

Heading.argTypes = { text: textControl }
