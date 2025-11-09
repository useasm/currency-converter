import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ArrowDownUp, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

// Popular currencies
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
]

// Mock exchange rates (replace with API later)
const mockExchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.08,
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('100')
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('EUR')
  const [convertedAmount, setConvertedAmount] = useState<number>(0)
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const calculateConversion = () => {
    const amountNum = parseFloat(amount) || 0
    const fromRate = mockExchangeRates[fromCurrency]
    const toRate = mockExchangeRates[toCurrency]
    const rate = toRate / fromRate
    setExchangeRate(rate)
    setConvertedAmount(amountNum * rate)
  }

  useEffect(() => {
    calculateConversion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency])

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleRefreshRates = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      calculateConversion()
      setIsLoading(false)
    }, 500)
  }

  const formatCurrency = (value: number, currencyCode: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  return (
    <div className="mx-auto max-w-2xl will-change-transform transform-gpu">
      <Card className="border bg-card p-6 text-card-foreground shadow animate-slide-up motion-safe:[animation-delay:40ms] rounded-[var(--radius)]">
        <div className="space-y-6">

          {/* From Amount + Currency */}
          <div className="space-y-2 animate-slide-up motion-safe:[animation-delay:80ms]">
            <Label htmlFor="from-amount" className="text-foreground">Amount</Label>
            <div className="flex gap-3">
              <Input
                id="from-amount"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-background text-foreground border-input focus-visible:ring-ring"
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-[180px] bg-background text-foreground border-input focus:ring-0">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground border">
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="focus:bg-muted">
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center animate-scale-in motion-safe:[animation-delay:120ms]">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCurrencies}
              aria-label="Swap currencies"
              className="rounded-full border-border transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ArrowDownUp className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
            </Button>
          </div>

          {/* To Amount + Currency */}
          <div className="space-y-2 animate-slide-up motion-safe:[animation-delay:160ms]">
            <Label htmlFor="to-amount" className="text-foreground">Converted Amount</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  id="to-amount"
                  type="text"
                  value={formatCurrency(convertedAmount, toCurrency)}
                  readOnly
                  className="pr-12 bg-background text-foreground border-input"
                />
              </div>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-[180px] bg-background text-foreground border-input focus:ring-0">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground border">
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="focus:bg-muted">
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rate info */}
          <div className="rounded-[calc(var(--radius)-4px)] bg-muted/40 p-4 animate-slide-up motion-safe:[animation-delay:200ms]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Exchange rate</span>
              </div>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </Badge>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshRates}
                disabled={isLoading}
                className="text-foreground/80 hover:bg-accent transition-all duration-200"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Reference */}
      <Card className="mt-6 border bg-card p-4 text-card-foreground shadow animate-slide-up motion-safe:[animation-delay:240ms] rounded-[var(--radius)]">
        <h3 className="mb-3 font-semibold text-foreground">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 10, 100, 1000].map((value, idx) => {
            const converted = value * exchangeRate
            return (
              <div
                key={value}
                className="rounded-lg bg-background p-3 text-center border border-border animate-slide-up"
                style={{ animationDelay: `${280 + idx * 40}ms` }} // stagger per card
              >
                <div className="text-sm text-muted-foreground">
                  {value} {fromCurrency}
                </div>
                <div
                  className="font-medium text-foreground"
                  key={`${fromCurrency}-${toCurrency}-${value}-${exchangeRate}`} // re-animate when changes
                >
                  {formatCurrency(converted, toCurrency)}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}