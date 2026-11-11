import { useQuery } from '@tanstack/react-query'
import { fetchRate, type RateResult } from '../lib/currencyApi'

export function useConvert(from: string, to: string, enabled = true) {
  return useQuery<RateResult>({
    queryKey: ['rate', from, to],
    queryFn: () => fetchRate(from, to),
    enabled: enabled && !!from && !!to && from !== to,
  })
}
