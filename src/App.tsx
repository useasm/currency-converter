import { useState, useEffect } from 'react';
import { CurrencyConverter } from './components/CurrencyConverter';
import { Moon, Sun } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-gray-900 dark:text-white">Currency Converter</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Get real-time exchange rates
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-full border-gray-300 dark:border-gray-600"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <CurrencyConverter />
      </div>
    </div>
  );
}
