// src/hooks/useConvert.ts
import { useQuery } from '@tanstack/react-query'
import { fetchLatestRate, type LatestResponse } from '../lib/currencyApi'

export function useConvert(from: string, to: string, enabled = true) {
  return useQuery<LatestResponse>({
    queryKey: ['convert', { from, to }],
    queryFn: () => fetchLatestRate(from, to),
    enabled: enabled && !!from && !!to && from !== to,
  })
}