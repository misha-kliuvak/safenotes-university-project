import React, { FC } from 'react'
import { withIcon, IconProps } from '@/common/hocs'

export const Arrow: FC<IconProps> = withIcon((props) => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.46735 12.9669L13.9336 8.5L9.46735 4.03312L8.53361 4.96686L11.4005 7.8331L2.00049 7.8331L2.00049 9.16685L11.4005 9.16685L8.53361 12.0331L9.46735 12.9669Z"
      fill="currentColor"
    />
  </svg>
))
