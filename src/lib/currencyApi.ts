// src/lib/currencyApi.ts
export type SymbolsMap = Record<string, string>

export type LatestResponse = {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

const BASE_URL = 'https://api.frankfurter.app'

export async function fetchSymbols(): Promise<SymbolsMap> {
  const res = await fetch(`${BASE_URL}/currencies`)
  if (!res.ok) throw new Error('Failed to load currencies')
  return res.json()
}

export async function fetchLatestRate(
  from: string,
  to: string | string[],
): Promise<LatestResponse> {
  const list = Array.isArray(to) ? to.join(',') : to
  const params = new URLSearchParams({ from, to: list })
  const res = await fetch(`${BASE_URL}/latest?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load latest rates')
  return res.json()
}