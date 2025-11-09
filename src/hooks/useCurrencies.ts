// src/hooks/useCurrencies.ts
import { useQuery } from '@tanstack/react-query'
import { fetchSymbols, type SymbolsMap } from '../lib/currencyApi'

export function useCurrencies() {
  return useQuery<SymbolsMap>({
    queryKey: ['symbols'],
    queryFn: fetchSymbols,
  })
}