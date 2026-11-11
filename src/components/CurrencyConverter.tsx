import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from './ui/select'
import { ArrowDownUp, TrendingUp, RefreshCw, AlertTriangle, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useCurrencies } from '../hooks/useCurrencies'
import { useConvert } from '../hooks/useConvert'
import type { SymbolsMap } from '../lib/currencyApi'

const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN', 'RUB', 'UAH']

const LS_AMOUNT = 'cc_amount'
const LS_FROM = 'cc_from'
const LS_TO = 'cc_to'

const DEFAULT_FROM = 'USD'
const DEFAULT_TO = 'EUR'

function readStorage(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable (private mode etc.)
  }
}

function getFlagEmoji(code: string) {
  return [...code.slice(0, 2).toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

function formatCurrency(value: number, code: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

type CurrencySelectProps = {
  value: string
  onChange: (code: string) => void
  symbols: SymbolsMap
  popular: string[]
  others: string[]
  disabled?: boolean
  ariaLabel: string
}

function CurrencySelect({ value, onChange, symbols, popular, others, disabled, ariaLabel }: CurrencySelectProps) {
  const renderItem = (code: string) => (
    <SelectItem key={code} value={code} className="focus:bg-muted">
      <span className="mr-2">{getFlagEmoji(code)}</span>
      {code} — {symbols[code]}
    </SelectItem>
  )

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-background border-input" aria-label={ariaLabel}>
        <SelectValue placeholder="Loading…" />
      </SelectTrigger>
      <SelectContent
        className="
          bg-card text-card-foreground border max-h-72 origin-top
          data-[state=open]:animate-slide-down
          data-[state=closed]:animate-fade-in
        "
      >
        <SelectGroup>
          <SelectLabel>Popular</SelectLabel>
          {popular.map(renderItem)}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>All</SelectLabel>
          {others.map(renderItem)}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState(() => readStorage(LS_AMOUNT, '100'))
  const [fromCurrency, setFromCurrency] = useState(() => readStorage(LS_FROM, DEFAULT_FROM))
  const [toCurrency, setToCurrency] = useState(() => readStorage(LS_TO, DEFAULT_TO))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => writeStorage(LS_AMOUNT, amount), [amount])
  useEffect(() => writeStorage(LS_FROM, fromCurrency), [fromCurrency])
  useEffect(() => writeStorage(LS_TO, toCurrency), [toCurrency])

  const { data: symbols, isLoading: loadingSymbols, isError: symbolsError, refetch: refetchSymbols } =
    useCurrencies()

  const allCodes = useMemo(() => (symbols ? Object.keys(symbols).sort() : []), [symbols])
  const popularCodes = useMemo(() => POPULAR.filter(c => allCodes.includes(c)), [allCodes])
  const otherCodes = useMemo(() => allCodes.filter(c => !POPULAR.includes(c)), [allCodes])

  // Drop codes saved earlier that the providers no longer offer (e.g. BGN).
  useEffect(() => {
    if (!symbols) return
    if (!(fromCurrency in symbols)) setFromCurrency(DEFAULT_FROM)
    if (!(toCurrency in symbols)) setToCurrency(DEFAULT_TO)
  }, [symbols, fromCurrency, toCurrency])

  const codesValid = !!symbols && fromCurrency in symbols && toCurrency in symbols
  const sameCurrency = fromCurrency === toCurrency

  const {
    data: rateData,
    isLoading: loadingRate,
    isError: rateError,
    refetch: refetchRate,
  } = useConvert(fromCurrency, toCurrency, codesValid)

  const rate = sameCurrency ? 1 : rateData?.rate
  const hasRate = codesValid && typeof rate === 'number'

  const parsedAmount = parseFloat(amount)
  const safeAmount = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0
  const convertedAmount = hasRate ? safeAmount * rate : 0
  const formattedResult = formatCurrency(convertedAmount, toCurrency)

  const lastUpdated = rateData?.date ? new Date(rateData.date) : null

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const started = Date.now()
    try {
      await (symbolsError ? refetchSymbols() : refetchRate())
    } finally {
      const rest = Math.max(0, 400 - (Date.now() - started))
      setTimeout(() => setIsRefreshing(false), rest)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard not available
    }
  }

  const selectProps = {
    symbols: symbols ?? {},
    popular: popularCodes,
    others: otherCodes,
    disabled: loadingSymbols || !symbols,
  }

  let status: ReactNode
  if (loadingSymbols || (codesValid && !sameCurrency && loadingRate)) {
    status = <Badge variant="secondary">Loading…</Badge>
  } else if (hasRate) {
    status = (
      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
        1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
      </Badge>
    )
  } else {
    status = (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3.5 w-3.5" />
        Rate unavailable
      </Badge>
    )
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <Card className="border text-card-foreground p-6 shadow-xl rounded-[var(--radius)] backdrop-blur-md">
        <div className="space-y-6">
          <div className="space-y-2 animate-slide-down motion-safe:[animation-delay:60ms]">
            <Label htmlFor="amount">Amount</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onWheel={e => e.currentTarget.blur()}
                className="w-full bg-background border-input [appearance:textfield]"
              />
              <CurrencySelect
                {...selectProps}
                value={fromCurrency}
                onChange={setFromCurrency}
                ariaLabel="From currency"
              />
            </div>
          </div>

          <div className="flex justify-center animate-fade-in motion-safe:[animation-delay:120ms]">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="rounded-full border-border transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Swap currencies"
            >
              <ArrowDownUp className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2 animate-slide-down motion-safe:[animation-delay:140ms]">
            <Label htmlFor="to">Converted Amount</Label>
            <div className="relative grid grid-cols-2 gap-3">
              <Input
                id="to"
                type="text"
                readOnly
                value={formattedResult}
                title="Click to copy"
                onClick={handleCopy}
                className="w-full bg-background border-input cursor-pointer select-all"
              />

              {copied && (
                <span className="pointer-events-none absolute left-2 top-[-18px] inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-0.5 text-xs font-medium text-white shadow animate-fade-in">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              )}

              <CurrencySelect
                {...selectProps}
                value={toCurrency}
                onChange={setToCurrency}
                ariaLabel="To currency"
              />
            </div>
          </div>

          <div className="rounded-[calc(var(--radius)-4px)] bg-muted/40 p-4 animate-fade-in motion-safe:[animation-delay:180ms]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Exchange Rate</span>
              </div>
              {status}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated ? lastUpdated.toLocaleDateString() : '—'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-foreground/80 hover:bg-accent"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {(symbolsError || rateError) && (
              <p className="mt-3 text-sm text-muted-foreground">
                Couldn't load exchange rates. Check your connection and press Refresh.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
