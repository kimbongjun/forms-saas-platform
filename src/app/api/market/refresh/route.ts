// src/app/api/market/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { fetchRssArticles, fetchNaverNewsArticles, fetchGoogleNewsArticles, fetchYoutubeContent } from '@/lib/market/fetchers'
import { deduplicateArticles, filterRecentArticles } from '@/lib/market/normalize'
import { claude, MODEL_BATCH } from '@/lib/claude'
import { MARKET_SYSTEM_PROMPT, buildArticleAnalysisPrompt, type RawArticle, type ArticleAnalysis } from '@/lib/prompts/market'

const BATCH_SIZE = 15

export async function POST(req: NextRequest) {
  // ── 인증: Cron Secret 또는 관리자 ─────────────────────────────
  const cronSecret = req.headers.get('x-cron-secret')
  const isValidCron = cronSecret === process.env.CRON_SECRET && !!process.env.CRON_SECRET

  const supabase = await createServerClient()

  if (!isValidCron) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'administrator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const triggeredBy = isValidCron ? 'cron' : 'admin'
  let articlesFetched = 0
  let articlesSaved = 0
  let claudeTokens = 0

  try {
    // ── Step 1: 수집 ───────────────────────────────────────────
    const [rss, naver, google, youtube] = await Promise.allSettled([
      fetchRssArticles(),
      fetchNaverNewsArticles(),
      fetchGoogleNewsArticles(),
      fetchYoutubeContent(),
    ])
    const all = [
      ...(rss.status === 'fulfilled' ? rss.value : []),
      ...(naver.status === 'fulfilled' ? naver.value : []),
      ...(google.status === 'fulfilled' ? google.value : []),
      ...(youtube.status === 'fulfilled' ? youtube.value : []),
    ]
    const articles = deduplicateArticles(filterRecentArticles(all, 7))
    articlesFetched = articles.length

    // ── Step 2: Claude 분석 ────────────────────────────────────
    const results: (ArticleAnalysis & { article: RawArticle })[] = []
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE)
      try {
        const message = await claude.messages.create({
          model: MODEL_BATCH,
          max_tokens: 4096,
          system: MARKET_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildArticleAnalysisPrompt(batch) }],
        })
        claudeTokens += message.usage.input_tokens + message.usage.output_tokens
        const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
        const analyses = JSON.parse(text) as ArticleAnalysis[]
        analyses.forEach((analysis, j) => { if (batch[j]) results.push({ ...analysis, article: batch[j] }) })
      } catch { /* 배치 실패 무시 */ }
    }

    // ── Step 3: DB 저장 ────────────────────────────────────────
    const rows = results
      .filter(r => r.priority_tier !== 'low')
      .map(({ article, ...analysis }) => ({
        source_type: article.source_type,
        category: analysis.category,
        title: article.title,
        summary_ko: analysis.summary_ko,
        key_insight: analysis.key_insight,
        original_url: article.url,
        source_name: article.source_name,
        thumbnail_url: article.thumbnail_url ?? null,
        published_at: article.published_at,
        credibility_score: analysis.credibility_score,
        priority_tier: analysis.priority_tier,
        tags: analysis.tags,
        fetched_at: new Date().toISOString(),
      }))

    if (rows.length) {
      const { error } = await supabase.from('market_articles').insert(rows)
      if (!error) articlesSaved = rows.length
    }

    await supabase.from('market_refresh_logs').insert({
      triggered_by: triggeredBy,
      articles_fetched: articlesFetched,
      articles_saved: articlesSaved,
      claude_tokens_used: claudeTokens,
      status: 'success',
    })

    return NextResponse.json({ success: true, articlesFetched, articlesSaved, claudeTokens })
  } catch (err) {
    await supabase.from('market_refresh_logs').insert({
      triggered_by: triggeredBy,
      articles_fetched: articlesFetched,
      articles_saved: articlesSaved,
      claude_tokens_used: claudeTokens,
      status: 'partial',
      error_detail: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Partial failure', articlesFetched }, { status: 500 })
  }
}
