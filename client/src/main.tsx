import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { StoreProvider, stores } from '@/common/store'
import '@/common/styles/global.scss'

import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <React.StrictMode>
      <BrowserRouter>
        <StoreProvider {...stores}>
          <App />
        </StoreProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
