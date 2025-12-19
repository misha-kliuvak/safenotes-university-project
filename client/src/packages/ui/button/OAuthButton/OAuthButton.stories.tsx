import React from 'react'

import GoogleButtonComponent from './OAuthButton'

export default {
  title: 'Buttons'
}

export const GoogleButton = (): JSX.Element => (
  <div className="tw-w-[250px]">
    <GoogleButtonComponent />
  </div>
)
