'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'

function resolveTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  const savedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getButtonClass(active: boolean) {
  if (active) {
    return 'brand-active shadow-sm'
  }

  return 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark-surface-button'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => resolveTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function applyTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">Theme</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => applyTheme('light')}
          className={[
            'flex items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-colors',
            getButtonClass(theme === 'light'),
          ].join(' ')}
          aria-pressed={theme === 'light'}
        >
          <Sun className="h-4 w-4" />
          라이트
        </button>
        <button
          type="button"
          onClick={() => applyTheme('dark')}
          className={[
            'flex items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-colors',
            getButtonClass(theme === 'dark'),
          ].join(' ')}
          aria-pressed={theme === 'dark'}
        >
          <Moon className="h-4 w-4" />
          다크
        </button>
      </div>
    </div>
  )
}
