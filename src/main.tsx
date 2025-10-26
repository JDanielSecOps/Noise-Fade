import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './components/theme-provider/theme-provider'
import "./styles/index.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryclient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryclient}>
      <Toaster richColors position="top-center"/>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App/>
    </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
