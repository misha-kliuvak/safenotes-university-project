import React, { FC } from 'react'
import { ICheckboxProps, Checkbox } from '../checkbox'

type RadioProps = Omit<ICheckboxProps, 'type'>

const Radio: FC<RadioProps> = (props) => <Checkbox {...props} type="radio" />

export default Radio
