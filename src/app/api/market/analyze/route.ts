import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { claude, MODEL_BATCH } from '@/lib/claude'
import { MARKET_SYSTEM_PROMPT, buildArticleAnalysisPrompt, type RawArticle, type ArticleAnalysis } from '@/lib/prompts/market'

const BATCH_SIZE = 15   // Haiku 컨텍스트·비용 균형

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { articles }: { articles: RawArticle[] } = await req.json()
  if (!articles?.length) return NextResponse.json({ error: 'articles 없음' }, { status: 400 })

  const results: (ArticleAnalysis & { article: RawArticle })[] = []
  let totalTokens = 0

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE)
    try {
      const message = await claude.messages.create({
        model: MODEL_BATCH,
        max_tokens: 4096,
        system: MARKET_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildArticleAnalysisPrompt(batch) }],
      })
      totalTokens += message.usage.input_tokens + message.usage.output_tokens
      const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
      const analyses = JSON.parse(text) as ArticleAnalysis[]
      analyses.forEach((analysis, j) => {
        if (batch[j]) results.push({ ...analysis, article: batch[j] })
      })
    } catch {
      // 배치 실패 시 해당 배치 스킵, 다음 배치 계속
    }
  }

  if (!results.length) return NextResponse.json({ saved: 0, tokens: totalTokens })

  // LOW 제외하고 저장
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

  const { error } = await supabase.from('market_articles').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ saved: rows.length, tokens: totalTokens })
}
