export type SymbolsMap = Record<string, string>

export type RateResult = {
  rate: number
  date: string
}

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1'
const FALLBACK_URL = 'https://open.er-api.com/v6/latest'

// Not published by the ECB (Frankfurter), so their rates come from the fallback provider.
export const FALLBACK_SYMBOLS: SymbolsMap = {
  RUB: 'Russian Ruble',
  UAH: 'Ukrainian Hryvnia',
}

// Bulgaria switched to the euro on 2026-01-01.
const EXCLUDED = new Set(['BGN'])

export async function fetchSymbols(): Promise<SymbolsMap> {
  const res = await fetch(`${FRANKFURTER_URL}/currencies`)
  if (!res.ok) throw new Error('Failed to load currencies')
  const data: SymbolsMap = await res.json()
  const merged = { ...data, ...FALLBACK_SYMBOLS }
  for (const code of EXCLUDED) delete merged[code]
  return merged
}

async function fetchFrankfurterRate(from: string, to: string): Promise<RateResult> {
  const params = new URLSearchParams({ from, to })
  const res = await fetch(`${FRANKFURTER_URL}/latest?${params}`)
  if (!res.ok) throw new Error('Failed to load exchange rate')
  const data: { date: string; rates: Record<string, number> } = await res.json()
  const rate = data.rates[to]
  if (!(rate > 0)) throw new Error(`No rate for ${from}/${to}`)
  return { rate, date: data.date }
}

async function fetchFallbackRate(from: string, to: string): Promise<RateResult> {
  const res = await fetch(`${FALLBACK_URL}/${encodeURIComponent(from)}`)
  if (!res.ok) throw new Error('Failed to load exchange rate')
  const data: { result: string; time_last_update_unix: number; rates: Record<string, number> } =
    await res.json()
  const rate = data.rates?.[to]
  if (data.result !== 'success' || !(rate > 0)) throw new Error(`No rate for ${from}/${to}`)
  return { rate, date: new Date(data.time_last_update_unix * 1000).toISOString() }
}

export function fetchRate(from: string, to: string): Promise<RateResult> {
  const needsFallback = from in FALLBACK_SYMBOLS || to in FALLBACK_SYMBOLS
  return needsFallback ? fetchFallbackRate(from, to) : fetchFrankfurterRate(from, to)
}
