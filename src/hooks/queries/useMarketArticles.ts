// src/hooks/queries/useMarketArticles.ts
import { useQuery } from '@tanstack/react-query'
import type { MarketArticle, MarketCategory, PriorityTier } from '@/types/database'

interface FetchParams {
  category?: MarketCategory
  tier?: PriorityTier
  limit?: number
}

async function fetchMarketArticles(params: FetchParams): Promise<MarketArticle[]> {
  const sp = new URLSearchParams()
  if (params.category) sp.set('category', params.category)
  if (params.tier) sp.set('tier', params.tier)
  if (params.limit) sp.set('limit', String(params.limit))
  const res = await fetch(`/api/market/articles?${sp.toString()}`)
  if (!res.ok) return []
  const data = (await res.json()) as { articles: MarketArticle[] }
  return data.articles ?? []
}

export function useMarketArticles(params: FetchParams = {}) {
  return useQuery({
    queryKey: ['market-articles', params],
    queryFn: () => fetchMarketArticles(params),
    staleTime: 1000 * 60 * 30,   // 30분 — daily 갱신이므로 길게 유지
    retry: 1,
  })
}
