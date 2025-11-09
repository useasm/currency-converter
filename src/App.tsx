import { useEffect, useState } from 'react'
import { CurrencyConverter } from './components/CurrencyConverter'
import { Moon, Sun } from 'lucide-react'
import { Button } from './components/ui/button'
import Footer from './components/Footer'

function getInitialTheme(): boolean {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* MAIN */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 animate-fade-in">
        {/* HEADER */}
        <header className="mb-10 flex items-center justify-between animate-slide-up">
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
            <span className="inline-flex transition-transform duration-500 will-change-transform">
              {isDarkMode ? <Sun className="h-5 w-5 rotate-180" /> : <Moon className="h-5 w-5 rotate-0" />}
            </span>
          </Button>
        </header>

        {/* MAIN CONTENT */}
        <section className="animate-slide-up motion-safe:[animation-delay:100ms]">
          <CurrencyConverter />
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}