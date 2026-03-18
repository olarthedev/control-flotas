import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const resolveSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

if (typeof window !== 'undefined') {
  const directTheme = window.localStorage.getItem('logi.user.theme')
  let mode: 'light' | 'dark' | 'system' = 'system'

  if (directTheme === 'light' || directTheme === 'dark' || directTheme === 'system') {
    mode = directTheme
  } else {
    try {
      const rawSettings = window.localStorage.getItem('logi.settings.basic.v2')
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings) as { theme?: string }
        if (parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system') {
          mode = parsed.theme
        } else if (parsed.theme === 'custom') {
          mode = 'dark'
        }
      }
    } catch {
      mode = 'system'
    }
  }

  const effective = mode === 'system' ? resolveSystemTheme() : mode
  document.documentElement.classList.toggle('dark', effective === 'dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
