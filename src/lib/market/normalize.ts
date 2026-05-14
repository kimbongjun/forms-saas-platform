// src/lib/market/normalize.ts
import type { RawArticle } from '@/lib/prompts/market'

/** URL 기준 중복 제거 */
export function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>()
  return articles.filter(a => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })
}

/** days일 이내 기사만 유지 */
export function filterRecentArticles(articles: RawArticle[], days = 7): RawArticle[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return articles.filter(a => {
    try { return new Date(a.published_at).getTime() > cutoff } catch { return true }
  })
}
