import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import ThemeProvider from './components/provider/ThemeProvider'
import ConfigProvider from './components/provider/ConfigProvider'
import "@/polyfills"
import '@/assets/css/index.css'

const app = createRoot(document.getElementById('app')!)

app.render(
  <StrictMode>
    <ConfigProvider>
      <ThemeProvider />
      <App />
    </ConfigProvider>
  </StrictMode>,
)
