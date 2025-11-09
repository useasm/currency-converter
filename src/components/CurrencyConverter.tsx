import { useState, useEffect, useMemo } from 'react'
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

const EXTRA_SYMBOLS: Record<string, string> = {
  RUB: 'Russian Ruble',
  UAH: 'Ukrainian Hryvnia',
  BGN: 'Bulgarian Lev',
}

const POPULAR = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','MXN','RUB','UAH','BGN'] as const

// ключи для localStorage
const LS_AMOUNT = 'cc_amount'
const LS_FROM   = 'cc_from'
const LS_TO     = 'cc_to'

function getFlagEmoji(code: string) {
  const cc = code.slice(0, 2)
  const base = 0x1f1e6
  const A = 'A'.charCodeAt(0)
  const chars = [...cc.toUpperCase()].map(c => String.fromCodePoint(base + (c.charCodeAt(0) - A)))
  return chars.join('')
}

export function CurrencyConverter() {
  // ИНИЦИАЛЬНЫЕ ЗНАЧЕНИЯ — ИЗ localStorage
  const [amount, setAmount] = useState<string>(() => localStorage.getItem(LS_AMOUNT) ?? '100')
  const [fromCurrency, setFromCurrency] = useState<string>(() => localStorage.getItem(LS_FROM) ?? 'USD')
  const [toCurrency, setToCurrency] = useState<string>(() => localStorage.getItem(LS_TO) ?? 'EUR')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  // СИНХРОНИЗАЦИЯ В localStorage
  useEffect(() => { localStorage.setItem(LS_AMOUNT, amount) }, [amount])
  useEffect(() => { localStorage.setItem(LS_FROM, fromCurrency) }, [fromCurrency])
  useEffect(() => { localStorage.setItem(LS_TO, toCurrency) }, [toCurrency])

  // symbols from API (+ extras for UI)
  const { data: symbols, isLoading: loadingSymbols } = useCurrencies()
  const providerCodes = useMemo(() => (symbols ? Object.keys(symbols) : []), [symbols])
  const providerSet = useMemo(() => new Set(providerCodes), [providerCodes])
  const mergedSymbols = useMemo(() => ({ ...(symbols ?? {}), ...EXTRA_SYMBOLS }), [symbols])

  const allCodes = useMemo(() => Object.keys(mergedSymbols).sort(), [mergedSymbols])
  const popularCodes = useMemo(() => POPULAR.filter(c => allCodes.includes(c)), [allCodes])
  const otherCodes = useMemo(() => allCodes.filter(c => !POPULAR.includes(c as any)), [allCodes])

  // can we convert with provider
  const providerHasBoth = providerSet.has(fromCurrency) && providerSet.has(toCurrency)
  const { data: rateData, isLoading: loadingRate, refetch } =
    useConvert(fromCurrency, toCurrency, providerHasBoth)

  const rawRate = rateData?.rates?.[toCurrency]
  const pairSupported = providerHasBoth && typeof rawRate === 'number' && isFinite(rawRate) && rawRate > 0
  const rate = pairSupported ? rawRate! : 0

  const parsedAmount = Number.isFinite(Number(amount)) ? parseFloat(amount || '0') : 0
  const safeAmount = isNaN(parsedAmount) ? 0 : Math.max(0, parsedAmount)
  const convertedAmount = useMemo(
    () => (pairSupported ? safeAmount * rate : 0),
    [safeAmount, rate, pairSupported]
  )

  useEffect(() => {
    if (rateData?.date) setLastUpdated(new Date(rateData.date))
  }, [rateData])

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const started = Date.now()
    try {
      await refetch()
      setLastUpdated(new Date())
    } finally {
      const spent = Date.now() - started
      const rest = Math.max(0, 400 - spent) // гарантированно видно спин
      setTimeout(() => setIsRefreshing(false), rest)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: toCurrency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(convertedAmount || 0)
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch { /* noop */ }
  }

  const formatCurrency = (value: number, code: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const disabled = loadingSymbols || loadingRate

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <Card className="border bg-surface text-card-foreground p-6 shadow-xl rounded-[var(--radius)] backdrop-blur-md">        <div className="space-y-6">

          {/* Amount + From */}
          <div className="space-y-2 animate-slide-down motion-safe:[animation-delay:60ms]">
            <Label htmlFor="amount">Amount</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onWheel={(e) => e.preventDefault()}
                className="w-full bg-background border-input [appearance:textfield]"
              />

              <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={loadingSymbols}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue />
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
                    {popularCodes.map((code) => (
                      <SelectItem key={code} value={code} className="focus:bg-muted">
                        <span className="mr-2">{getFlagEmoji(code)}</span>
                        {code} — {mergedSymbols?.[code] ?? '—'}
                        {!providerSet.has(code) && (
                          <span className="ml-2 text-xs text-muted-foreground">(no provider rate)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>All</SelectLabel>
                    {otherCodes.map((code) => (
                      <SelectItem key={code} value={code} className="focus:bg-muted">
                        <span className="mr-2">{getFlagEmoji(code)}</span>
                        {code} — {mergedSymbols?.[code] ?? '—'}
                        {!providerSet.has(code) && (
                          <span className="ml-2 text-xs text-muted-foreground">(no provider rate)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap */}
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

          {/* Converted + To */}
          <div className="space-y-2 animate-slide-down motion-safe:[animation-delay:140ms]">
            <Label htmlFor="to">Converted Amount</Label>
            <div className="relative grid grid-cols-2 gap-3">
              <Input
                id="to"
                type="text"
                readOnly
                value={formatCurrency(convertedAmount || 0, toCurrency)}
                title="Click to copy"
                onClick={handleCopy}
                className="w-full bg-background border-input cursor-pointer select-all"
              />

              {copied && (
                <span className="pointer-events-none absolute left-2 top-[-18px] inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-0.5 text-xs font-medium text-white shadow animate-fade-in">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              )}

              <Select value={toCurrency} onValueChange={setToCurrency} disabled={loadingSymbols}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue />
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
                    {popularCodes.map((code) => (
                      <SelectItem key={code} value={code} className="focus:bg-muted">
                        <span className="mr-2">{getFlagEmoji(code)}</span>
                        {code} — {mergedSymbols?.[code] ?? '—'}
                        {!providerSet.has(code) && (
                          <span className="ml-2 text-xs text-muted-foreground">(no provider rate)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>All</SelectLabel>
                    {otherCodes.map((code) => (
                      <SelectItem key={code} value={code} className="focus:bg-muted">
                        <span className="mr-2">{getFlagEmoji(code)}</span>
                        {code} — {mergedSymbols?.[code] ?? '—'}
                        {!providerSet.has(code) && (
                          <span className="ml-2 text-xs text-muted-foreground">(no provider rate)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-[calc(var(--radius)-4px)] bg-muted/40 p-4 animate-fade-in motion-safe:[animation-delay:180ms]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Exchange Rate</span>
              </div>

              {pairSupported ? (
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Not supported by provider
                </Badge>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleDateString()}
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

            {!pairSupported && (
              <p className="mt-3 text-sm text-muted-foreground">
                This currency pair is not available from the current data provider.
                Try two supported currencies (e.g., USD, EUR, BGN, GBP, JPY, etc.).
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}