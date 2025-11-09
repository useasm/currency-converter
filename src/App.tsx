import { useState, useEffect } from 'react'
import { CurrencyConverter } from './components/CurrencyConverter'
import { Moon, Sun } from 'lucide-react'
import { Button } from './components/ui/button'

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* 👇 ключ на теме заставит main пере-анимироваться */}
      <main
        key={isDarkMode ? 'dark' : 'light'}
        className="mx-auto max-w-4xl px-4 py-8 animate-fade-in"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-slide-up">
          <div className="animate-scale-in">
            <h1 className="text-3xl font-bold text-foreground">Currency Converter</h1>
            <p className="mt-2 text-muted-foreground">Get real-time exchange rates</p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(v => !v)}
            className="rounded-full border-border transition-transform duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            {/* плавный поворот иконки при смене */}
            <span className="inline-flex transition-transform duration-300 will-change-transform">
              {isDarkMode ? <Sun className="h-5 w-5 rotate-180" /> : <Moon className="h-5 w-5 rotate-0" />}
            </span>
          </Button>
        </div>

        {/* Основной модуль */}
        <section className="animate-slide-up">
          <CurrencyConverter />
        </section>
      </main>
    </div>
  )
}