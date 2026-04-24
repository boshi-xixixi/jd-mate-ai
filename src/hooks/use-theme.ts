'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/lib/store'

export function useTheme() {
  const { theme, setTheme } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches)
      } else {
        root.classList.toggle('dark', theme === 'dark')
      }
    }

    applyTheme()

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme)
      return () => mediaQuery.removeEventListener('change', applyTheme)
    }
  }, [theme])

  const resolvedTheme = (() => {
    if (theme === 'system') {
      if (typeof window === 'undefined') return 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  })()

  return { theme, setTheme, resolvedTheme }
}
