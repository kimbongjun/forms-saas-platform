# Claude API 파이프라인 고도화 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시장조사(Market) 전 섹션에 RSS·Naver·Google News·YouTube 실데이터 + Claude Haiku 검증 파이프라인을 연결하고, 썸콘텐츠(SomeContent) AI 분석을 Groq(감성 태깅 유지)·Claude Sonnet(심층 인사이트 교체) 역할 분리 구조로 고도화한다.

**Architecture:** 두 파이프라인 완전 독립. 시장조사는 Vercel Cron(09:00 KST) + 관리자 수동 트리거 → Claude Haiku 배치 검증 → Supabase 저장. 썸콘텐츠는 기존 sync 완료 후 Claude Sonnet 자동 트리거 → sc_claude_insights 캐시. Claude 오류 시 시장조사는 이전 캐시 연장, 썸콘텐츠는 Groq 폴백.

**Tech Stack:** Next.js 16 App Router · TypeScript · Supabase · @anthropic-ai/sdk · rss-parser · Tailwind CSS v4 · TanStack Query · Vercel Cron

**Spec:** `docs/superpowers/specs/2026-05-14-claude-pipeline-design.md`

---

## 파일 맵

### 신규 생성
| 파일 | 역할 |
|---|---|
| `src/lib/claude.ts` | Anthropic SDK 싱글톤 + 모델 상수 |
| `src/lib/prompts/market.ts` | 시장조사 프롬프트 + 입출력 타입 |
| `src/lib/prompts/some-content.ts` | 썸콘텐츠 프롬프트 + 입출력 타입 |
| `src/lib/market/fetchers.ts` | RSS·Naver·Google News·YouTube 수집 함수 |
| `src/lib/market/normalize.ts` | 중복제거·기간필터 유틸 |
| `src/app/api/market/ingest/route.ts` | POST — 수집 + 정규화 |
| `src/app/api/market/analyze/route.ts` | POST — Claude Haiku 배치 분석 + DB 저장 |
| `src/app/api/some-content/claude-analysis/route.ts` | POST — Claude Sonnet 심층 분석 |
| `src/hooks/queries/useMarketArticles.ts` | React Query 훅 (시장조사 클라이언트) |

### 수정
| 파일 | 변경 내용 |
|---|---|
| `src/app/api/market/refresh/route.ts` | 빈 파일 → Cron + 관리자 파이프라인 오케스트레이터 구현 |
| `src/app/api/market/articles/route.ts` | credibility_score 정렬·tier 필터·48h TTL 추가 |
| `src/app/api/some-content/insights/route.ts` | Groq → Claude Sonnet 교체 |
| `src/app/api/some-content/mentions/sync/route.ts` | sync 완료 후 claude-analysis 자동 트리거 |
| `src/app/market/_components/MarketNav.tsx` | Competitors 탭 제거 (5→4탭) |
| `src/app/market/_components/DailyReportClient.tsx` | 실 API 데이터로 MARKET_SIGNALS 교체 + 반응형 |
| `src/app/market/_components/TechAiClient.tsx` | 실 API 데이터로 기사 교체 + Skeleton |
| `src/app/market/_components/EventsClient.tsx` | 실 API 데이터로 이벤트 교체 + Skeleton |
| `src/app/market/_components/InfluencerClient.tsx` | 실 API 데이터로 KOL 교체 + Skeleton |
| `src/app/some-content/_components/SomeContentClient.tsx` | Channel Explorer 탭 제거 → Dashboard 아코디언 통합 |
| `src/app/some-content/_components/TrendAnalysisView.tsx` | claude-analysis 엔드포인트 교체 + Claude 배지 |
| `src/types/database.ts` | MarketArticle·MarketRefreshLog·ScClaudeInsight 타입 추가 |
| `vercel.json` | Cron 스케줄 등록 |

---

## Task 1: 패키지 설치 및 환경변수 설정

**Files:**
- Modify: `package.json` (npm install 실행)
- Modify: `.env.local` (신규 키 추가)

- [ ] **Step 1: rss-parser · @anthropic-ai/sdk 설치**

```bash
npm install @anthropic-ai/sdk rss-parser
npm install -D @types/rss-parser
```

Expected output: `added N packages`

- [ ] **Step 2: .env.local에 신규 환경변수 추가**

```env
# 신규 추가 (기존 키 아래에 추가)
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=your-random-secret-32chars
```

- [ ] **Step 3: 설치 확인**

```bash
node -e "require('@anthropic-ai/sdk'); console.log('ok')"
node -e "require('rss-parser'); console.log('ok')"
```

Expected: `ok` 두 줄

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: @anthropic-ai/sdk + rss-parser 설치"
```

---

## Task 2: Supabase DB 마이그레이션

**Files:**
- Run in Supabase SQL Editor (Dashboard → SQL Editor)

- [ ] **Step 1: market_articles 테이블 스키마 확정 (기존 테이블에 컬럼 추가)**

Supabase SQL Editor에서 실행:

```sql
-- market_articles 신규 컬럼 추가 (이미 컬럼이 있으면 무시됨)
ALTER TABLE market_articles
  ADD COLUMN IF NOT EXISTS source_type   text,
  ADD COLUMN IF NOT EXISTS summary_ko    text,
  ADD COLUMN IF NOT EXISTS key_insight   text,
  ADD COLUMN IF NOT EXISTS source_name   text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS credibility_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority_tier text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS tags          text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fetched_at    timestamptz DEFAULT now();

-- RLS: 인증 사용자 읽기 허용
ALTER TABLE market_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "authenticated_read" ON market_articles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "service_insert" ON market_articles
  FOR INSERT TO authenticated USING (true);
```

- [ ] **Step 2: market_refresh_logs 테이블 생성**

```sql
CREATE TABLE IF NOT EXISTS market_refresh_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by       text NOT NULL,         -- 'cron' | 'admin'
  articles_fetched   int  DEFAULT 0,
  articles_saved     int  DEFAULT 0,
  claude_tokens_used int  DEFAULT 0,
  status             text NOT NULL,          -- 'success' | 'partial' | 'failed'
  error_detail       text,
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE market_refresh_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "authenticated_read" ON market_refresh_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "service_insert" ON market_refresh_logs
  FOR INSERT TO authenticated USING (true);
```

- [ ] **Step 3: sc_claude_insights 테이블 생성**

```sql
CREATE TABLE IF NOT EXISTS sc_claude_insights (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id   uuid REFERENCES sc_keywords(id) ON DELETE CASCADE,
  keyword      text NOT NULL,
  insight_type text NOT NULL,   -- 'comprehensive' | 'cross_channel'
  payload      jsonb NOT NULL,
  token_used   int  DEFAULT 0,
  model        text DEFAULT 'claude-sonnet-4-6',
  generated_at timestamptz DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

ALTER TABLE sc_claude_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "authenticated_read" ON sc_claude_insights
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "authenticated_write" ON sc_claude_insights
  FOR ALL TO authenticated USING (true);
```

- [ ] **Step 4: 확인 쿼리**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'market_articles' ORDER BY ordinal_position;

SELECT table_name FROM information_schema.tables
WHERE table_name IN ('market_refresh_logs', 'sc_claude_insights');
```

Expected: market_articles에 credibility_score·priority_tier 등 포함, 두 신규 테이블 조회됨

---

## Task 3: TypeScript 타입 추가

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: 파일 끝에 타입 추가**

`src/types/database.ts` 파일 끝에 다음을 추가:

```typescript
// ── Market Intelligence ───────────────────────────────────────────

export type MarketCategory = 'tech_ai' | 'marketing_kol' | 'events' | 'daily'
export type PriorityTier = 'top' | 'standard' | 'low'
export type MarketSourceType = 'rss' | 'naver' | 'google_news' | 'youtube'

export interface MarketArticle {
  id: string
  source_type: MarketSourceType
  category: MarketCategory
  title: string
  summary_ko: string | null
  key_insight: string | null
  original_url: string
  source_name: string | null
  thumbnail_url: string | null
  published_at: string | null
  credibility_score: number
  priority_tier: PriorityTier
  tags: string[]
  fetched_at: string
  created_at: string
}

export interface MarketRefreshLog {
  id: string
  triggered_by: 'cron' | 'admin'
  articles_fetched: number
  articles_saved: number
  claude_tokens_used: number
  status: 'success' | 'partial' | 'failed'
  error_detail: string | null
  created_at: string
}

// ── SomeContent Claude Insights ───────────────────────────────────

export interface ScClaudeInsight {
  id: string
  keyword_id: string
  keyword: string
  insight_type: 'comprehensive' | 'cross_channel'
  payload: Record<string, unknown>
  token_used: number
  model: string
  generated_at: string
  expires_at: string
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/types/database.ts
git commit -m "feat: MarketArticle·MarketRefreshLog·ScClaudeInsight 타입 추가"
```

---

## Task 4: Claude 클라이언트 + 시장조사 프롬프트

**Files:**
- Create: `src/lib/claude.ts`
- Create: `src/lib/prompts/market.ts`

- [ ] **Step 1: Claude SDK 클라이언트 생성**

```typescript
// src/lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** 시장조사 배치 처리 — 속도·비용 최적 */
export const MODEL_BATCH = 'claude-haiku-4-5-20251001'

/** 썸콘텐츠 심층 인사이트 — 품질 최적 */
export const MODEL_INSIGHT = 'claude-sonnet-4-6'
```

- [ ] **Step 2: 시장조사 프롬프트 파일 생성**

```typescript
// src/lib/prompts/market.ts
import type { MarketCategory, PriorityTier, MarketSourceType } from '@/types/database'

export interface RawArticle {
  title: string
  description: string
  url: string
  source_name: string
  published_at: string   // ISO 8601
  source_type: MarketSourceType
  thumbnail_url?: string
}

export interface ArticleAnalysis {
  credibility_score: number
  priority_tier: PriorityTier
  category: MarketCategory
  summary_ko: string
  key_insight: string
  tags: string[]
}

export const MARKET_SYSTEM_PROMPT = `당신은 뷰티·의료기기 마케팅 산업 전문 애널리스트입니다.
수집된 기사를 분석해 마케터에게 유용한 인사이트를 제공합니다.
반드시 JSON 배열만 출력하세요. 마크다운이나 설명 텍스트를 포함하지 마세요.`

export function buildArticleAnalysisPrompt(articles: RawArticle[]): string {
  const list = articles
    .map((a, i) =>
      `[${i}] 제목: ${a.title}\n출처: ${a.source_name}\n발행일: ${a.published_at}\n내용: ${(a.description ?? '').slice(0, 200)}`,
    )
    .join('\n\n')

  return `다음 ${articles.length}개 기사를 분석하여 아래 JSON 배열로 응답하세요.

채점 기준:
- source_credibility(30점): 공신력 있는 언론사·전문지 여부
- recency_score(25점): 오늘 기준 1일=25 / 3일=18 / 7일=12 / 그 이상=5
- relevance_score(30점): 뷰티·의료기기·에스테틱·마케팅 관련성
- novelty_score(15점): 신규 정보=15 / 반복·중복=5

priority_tier: 합계 80이상="top", 50-79="standard", 49이하="low"
category: "tech_ai"(기술·AI·규제) | "marketing_kol"(인플루언서·캠페인) | "events"(전시·행사) | "daily"(일반 시장 동향)

기사 목록:
${list}

JSON 배열만 출력 (기사 순서와 동일한 인덱스):
[{"credibility_score":0,"priority_tier":"low","category":"daily","summary_ko":"","key_insight":"","tags":[]}]`
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/lib/claude.ts src/lib/prompts/market.ts
git commit -m "feat: Claude SDK 클라이언트 + 시장조사 프롬프트"
```

---

## Task 5: 썸콘텐츠 프롬프트

**Files:**
- Create: `src/lib/prompts/some-content.ts`

- [ ] **Step 1: 파일 생성**

```typescript
// src/lib/prompts/some-content.ts

export const SOME_CONTENT_SYSTEM_PROMPT = `당신은 한국 소셜미디어 빅데이터 분석 전문가입니다.
브랜드 키워드의 채널별 반응 패턴을 분석하고 마케팅 전략 방향성을 도출합니다.
반드시 JSON만 출력하세요. 마크다운이나 설명 텍스트를 포함하지 마세요.`

export interface InsightInput {
  keyword: string
  mentionsByChannel: Record<string, number>
  sentimentDistribution: { positive: number; negative: number; neutral: number }
  topKeywords: string[]
  metrics?: {
    trend: string
    growthRate: number
    volatility: number
    avg: number
    recent3Avg: number
    maxMonth: string
    minMonth: string
  }
}

export interface InsightOutput {
  trend_summary: string
  opportunities: string[]
  risks: string[]
  recommendations: string[]
}

export function buildInsightPrompt(input: InsightInput): string {
  const trendDesc = input.metrics
    ? `트렌드: ${input.metrics.trend === 'up' ? '상승세' : input.metrics.trend === 'down' ? '하락세' : '보합세'}, 성장률 ${input.metrics.growthRate > 0 ? '+' : ''}${input.metrics.growthRate}%, 변동성 ${input.metrics.volatility}%`
    : ''

  return `키워드 "${input.keyword}" 소셜 빅데이터 분석 결과를 바탕으로 마케팅 인사이트를 제공하세요.

채널별 언급량: ${JSON.stringify(input.mentionsByChannel)}
감성 분포: 긍정 ${input.sentimentDistribution.positive}% / 부정 ${input.sentimentDistribution.negative}% / 중립 ${input.sentimentDistribution.neutral}%
주요 키워드: ${input.topKeywords.slice(0, 20).join(', ')}
${trendDesc}

JSON 형식으로만 응답:
{"trend_summary":"2~3문장 트렌드 해석","opportunities":["기회요인1","기회요인2","기회요인3"],"risks":["리스크1","리스크2"],"recommendations":["실행방안1","실행방안2","실행방안3"]}`
}

export interface CrossChannelInput {
  keyword: string
  trendData: unknown
  mentionSummary: unknown
  topPosts: { channel: string; content: string; sentiment: string | null }[]
}

export interface CrossChannelOutput {
  narrative: string
  channel_insights: { channel: string; insight: string }[]
  consumer_pattern: string
  priority_keywords: string[]
}

export function buildCrossChannelPrompt(input: CrossChannelInput): string {
  return `키워드 "${input.keyword}"의 트렌드와 멀티채널 데이터를 종합 분석하세요.

트렌드 데이터: ${JSON.stringify(input.trendData)}
채널별 언급 요약: ${JSON.stringify(input.mentionSummary)}
주요 포스트: ${JSON.stringify(input.topPosts.slice(0, 10))}

JSON 형식으로만 응답:
{"narrative":"4~6문장 전체 트렌드 내러티브","channel_insights":[{"channel":"","insight":""}],"consumer_pattern":"소비자 반응 패턴 2~3문장","priority_keywords":["키워드1","키워드2","키워드3"]}`
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/prompts/some-content.ts
git commit -m "feat: 썸콘텐츠 Claude 프롬프트 추가"
```

---

## Task 6: 시장조사 데이터 수집 (Fetchers)

**Files:**
- Create: `src/lib/market/fetchers.ts`

- [ ] **Step 1: fetchers.ts 생성**

```typescript
// src/lib/market/fetchers.ts
import Parser from 'rss-parser'
import type { RawArticle } from '@/lib/prompts/market'

const parser = new Parser({ timeout: 10000 })

// ── RSS 소스 목록 ─────────────────────────────────────────────────
const RSS_SOURCES = [
  { url: 'https://www.etnews.com/rss/allArticle.xml',    name: '전자신문',    category: 'tech_ai' },
  { url: 'https://zdnet.co.kr/Include/rss.xml',          name: 'ZDNet Korea', category: 'tech_ai' },
  { url: 'https://it.chosun.com/rss/rss.htm',            name: 'IT조선',      category: 'tech_ai' },
  { url: 'https://www.mediaus.co.kr/rss/allArticle.xml', name: '미디어스',    category: 'marketing_kol' },
  { url: 'https://beautyhankook.com/feed',               name: '뷰티한국',    category: 'marketing_kol' },
] as const

export async function fetchRssArticles(): Promise<RawArticle[]> {
  const results: RawArticle[] = []
  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      for (const item of (feed.items ?? []).slice(0, 8)) {
        if (!item.title || !item.link) continue
        results.push({
          title: item.title.trim(),
          description: item.contentSnippet ?? item.summary ?? '',
          url: item.link,
          source_name: source.name,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source_type: 'rss',
          thumbnail_url: item.enclosure?.url,
        })
      }
    } catch {
      // 개별 피드 실패 무시 — 다음 피드 계속
    }
  }
  return results
}

// ── Naver 뉴스 검색 API ───────────────────────────────────────────
const NAVER_KEYWORDS = [
  '뷰티 AI 기술',
  '의료기기 마케팅',
  '인플루언서 마케팅 트렌드',
  '메디컬 에스테틱',
  '뷰티 박람회',
]

export async function fetchNaverNewsArticles(): Promise<RawArticle[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) return []

  const results: RawArticle[] = []
  for (const keyword of NAVER_KEYWORDS) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=10&sort=date`,
        {
          headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
          signal: AbortSignal.timeout(8000),
        },
      )
      if (!res.ok) continue
      const data = (await res.json()) as { items?: { title: string; description: string; originallink: string; link: string; pubDate: string }[] }
      for (const item of data.items ?? []) {
        results.push({
          title: item.title.replace(/<[^>]+>/g, '').trim(),
          description: item.description.replace(/<[^>]+>/g, '').trim(),
          url: item.originallink || item.link,
          source_name: 'Naver 뉴스',
          published_at: new Date(item.pubDate).toISOString(),
          source_type: 'naver',
        })
      }
    } catch {
      // 키워드별 실패 무시
    }
  }
  return results
}

// ── Google News RSS ───────────────────────────────────────────────
const GOOGLE_NEWS_QUERIES = [
  '뷰티 의료기기 기술 AI',
  'K-beauty 인플루언서 마케팅',
  '뷰티 박람회 행사 2026',
]

export async function fetchGoogleNewsArticles(): Promise<RawArticle[]> {
  const results: RawArticle[] = []
  for (const q of GOOGLE_NEWS_QUERIES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue
      const text = await res.text()
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) ?? []
      for (const item of items.slice(0, 8)) {
        const title = item.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>/)?.[1]
          ?? item.match(/<title>(.+?)<\/title>/)?.[1]
          ?? ''
        const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? ''
        const pubDate = item.match(/<pubDate>(.+?)<\/pubDate>/)?.[1] ?? ''
        const source = item.match(/<source[^>]*><!\[CDATA\[(.+?)\]\]><\/source>/)?.[1]
          ?? item.match(/<source[^>]*>(.+?)<\/source>/)?.[1]
          ?? 'Google News'
        if (!title || !link) continue
        results.push({
          title: title.trim(),
          description: '',
          url: link.trim(),
          source_name: source.trim(),
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source_type: 'google_news',
        })
      }
    } catch {
      // 쿼리별 실패 무시
    }
  }
  return results
}

// ── YouTube Data API ──────────────────────────────────────────────
export async function fetchYoutubeContent(): Promise<RawArticle[]> {
  const ytKey = process.env.YOUTUBE_API_KEY
  if (!ytKey) return []
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('뷰티 마케팅 트렌드 2026')}&type=video&order=date&maxResults=10&relevanceLanguage=ko&key=${ytKey}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    const data = (await res.json()) as {
      items?: { id: { videoId: string }; snippet: { title: string; description: string; channelTitle: string; publishedAt: string; thumbnails?: { medium?: { url: string } } } }[]
    }
    return (data.items ?? []).map(item => ({
      title: item.snippet.title,
      description: item.snippet.description.slice(0, 200),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source_name: item.snippet.channelTitle,
      published_at: item.snippet.publishedAt,
      source_type: 'youtube' as const,
      thumbnail_url: item.snippet.thumbnails?.medium?.url,
    }))
  } catch {
    return []
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/market/fetchers.ts
git commit -m "feat: 시장조사 RSS·Naver·Google News·YouTube 수집 함수"
```

---

## Task 7: 정규화 유틸 + useMarketArticles 훅

**Files:**
- Create: `src/lib/market/normalize.ts`
- Create: `src/hooks/queries/useMarketArticles.ts`

- [ ] **Step 1: normalize.ts 생성**

```typescript
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
```

- [ ] **Step 2: useMarketArticles 훅 생성**

```typescript
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
```

- [ ] **Step 3: 커밋**

```bash
git add src/lib/market/normalize.ts src/hooks/queries/useMarketArticles.ts
git commit -m "feat: 시장조사 정규화 유틸 + useMarketArticles 훅"
```

---

## Task 8: Market ingest API 라우트

**Files:**
- Create: `src/app/api/market/ingest/route.ts`

- [ ] **Step 1: ingest/route.ts 생성**

```typescript
// src/app/api/market/ingest/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { fetchRssArticles, fetchNaverNewsArticles, fetchGoogleNewsArticles, fetchYoutubeContent } from '@/lib/market/fetchers'
import { deduplicateArticles, filterRecentArticles } from '@/lib/market/normalize'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  return NextResponse.json({ articles, count: articles.length })
}
```

- [ ] **Step 2: 동작 확인 (로컬 서버 기동 후)**

```bash
curl -s -X POST http://localhost:3000/api/market/ingest \
  -H "Cookie: <로그인_쿠키>" | head -c 500
```

Expected: `{"articles":[...],"count":N}` (N > 0)

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/market/ingest/route.ts
git commit -m "feat: 시장조사 ingest API — RSS·Naver·Google News·YouTube 수집"
```

---

## Task 9: Market analyze API 라우트 (Claude Haiku)

**Files:**
- Create: `src/app/api/market/analyze/route.ts`

- [ ] **Step 1: analyze/route.ts 생성**

```typescript
// src/app/api/market/analyze/route.ts
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
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/api/market/analyze/route.ts
git commit -m "feat: 시장조사 Claude Haiku 배치 분석 API"
```

---

## Task 10: Market refresh 라우트 + vercel.json Cron

**Files:**
- Modify: `src/app/api/market/refresh/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: refresh/route.ts 구현**

```typescript
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
```

- [ ] **Step 2: vercel.json Cron 등록**

```json
{
  "crons": [
    {
      "path": "/api/market/refresh",
      "schedule": "0 0 * * *"
    }
  ]
}
```

> `0 0 * * *` = UTC 00:00 = KST 09:00

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/market/refresh/route.ts vercel.json
git commit -m "feat: Market refresh 파이프라인 + Vercel Cron 09:00 KST 등록"
```

---

## Task 11: Market articles GET 라우트 개선

**Files:**
- Modify: `src/app/api/market/articles/route.ts`

- [ ] **Step 1: 기존 파일 전체 교체**

```typescript
// src/app/api/market/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const tier = searchParams.get('tier')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 100)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 48시간 TTL: 이전 데이터는 폴백용으로 72시간까지 허용
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - 72)

  let query = supabase
    .from('market_articles')
    .select('*')
    .gte('fetched_at', cutoff.toISOString())
    .order('credibility_score', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') query = query.eq('category', category)
  if (tier) query = query.eq('priority_tier', tier)

  const { data, error } = await query
  if (error) return NextResponse.json({ articles: [], error: error.message })

  return NextResponse.json({ articles: data ?? [], count: data?.length ?? 0 })
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/api/market/articles/route.ts
git commit -m "feat: Market articles GET — credibility 정렬·tier 필터·72h TTL"
```

---

## Task 12: Market UI — MarketNav 정리 + DailyReportClient 실데이터

**Files:**
- Modify: `src/app/market/_components/MarketNav.tsx`
- Modify: `src/app/market/_components/DailyReportClient.tsx`

- [ ] **Step 1: MarketNav에서 Competitors 탭 제거**

`src/app/market/_components/MarketNav.tsx`의 TABS 배열에서 Competitors 항목 제거:

```typescript
// 변경 전
const TABS = [
  { href: '/market', label: 'Daily Report', icon: LayoutDashboard },
  { href: '/market/competitors', label: 'Competitors', icon: Building2 },
  { href: '/market/tech-ai', label: 'Tech & AI', icon: Cpu },
  { href: '/market/events', label: 'Events', icon: CalendarDays },
  { href: '/market/marketing-influencer', label: 'KOL & Campaigns', icon: Users },
]

// 변경 후
const TABS = [
  { href: '/market', label: 'Daily Report', icon: LayoutDashboard },
  { href: '/market/tech-ai', label: 'Tech & AI', icon: Cpu },
  { href: '/market/events', label: 'Events', icon: CalendarDays },
  { href: '/market/marketing-influencer', label: 'KOL & Campaigns', icon: Users },
]
```

불필요해진 `Building2` import도 제거.

- [ ] **Step 2: DailyReportClient 상단에 실데이터 훅 추가**

`DailyReportClient.tsx` 파일 상단 imports 아래에 추가:

```typescript
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'
```

컴포넌트 함수 내부 최상단에 추가:

```typescript
const { data: dailyArticles = [], isLoading: isDailyLoading } = useMarketArticles({ category: 'daily', limit: 20 })
const { data: topArticles = [] } = useMarketArticles({ tier: 'top', limit: 6 })
```

- [ ] **Step 3: MARKET_SIGNALS 상수를 실데이터로 교체**

DailyReportClient에서 하드코딩된 `MARKET_SIGNALS` 렌더링 부분을 찾아 아래로 교체:

```typescript
{/* Market Signals 섹션 — 실데이터 */}
{isDailyLoading ? (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
    ))}
  </div>
) : dailyArticles.length > 0 ? (
  <div className="space-y-3">
    {dailyArticles.map((article: MarketArticle) => (
      <a
        key={article.id}
        href={article.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-[#002D74] hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={[
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                article.priority_tier === 'top' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600',
              ].join(' ')}>
                {article.priority_tier === 'top' ? '주요' : '일반'}
              </span>
              <span className="text-xs text-gray-400 truncate">{article.source_name}</span>
            </div>
            <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
            {article.key_insight && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-1">💡 {article.key_insight}</p>
            )}
          </div>
          <ExternalLink className="h-4 w-4 shrink-0 text-gray-300 mt-1" />
        </div>
      </a>
    ))}
  </div>
) : (
  /* 실데이터 없을 때 기존 MARKET_SIGNALS 하드코딩 유지 */
  <div className="space-y-3">
    {MARKET_SIGNALS.map((signal, i) => (
      /* 기존 렌더링 코드 그대로 */
      <div key={i}>{/* 기존 코드 */}</div>
    ))}
  </div>
)}
```

- [ ] **Step 4: 반응형 — 탭 내비 모바일 스크롤 확인**

`MarketNav.tsx` nav 태그에 `sm:px-4` 반응형 padding 추가 (기존 `px-6` 유지, 모바일에서 `px-2`):

```typescript
<nav className="border-b border-gray-200 bg-white">
  <div className="flex overflow-x-auto px-2 sm:px-6">
```

- [ ] **Step 5: 커밋**

```bash
git add src/app/market/_components/MarketNav.tsx \
        src/app/market/_components/DailyReportClient.tsx
git commit -m "feat: Market Daily Report — Competitors 탭 제거 + 실데이터 시장 신호 연결"
```

---

## Task 13: Market UI — TechAiClient + EventsClient 실데이터

**Files:**
- Modify: `src/app/market/_components/TechAiClient.tsx`
- Modify: `src/app/market/_components/EventsClient.tsx`

- [ ] **Step 1: TechAiClient 상단에 훅 추가**

```typescript
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'
```

컴포넌트 내부:

```typescript
const { data: articles = [], isLoading } = useMarketArticles({ category: 'tech_ai', limit: 30 })
```

- [ ] **Step 2: TechAiClient — 기존 하드코딩 기사 목록을 실데이터로 교체**

기사 리스트가 렌더링되는 섹션을 찾아 아래로 교체:

```typescript
{isLoading ? (
  <div className="space-y-4">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
    ))}
  </div>
) : (
  <div className="space-y-4">
    {articles.map((article: MarketArticle) => (
      <a
        key={article.id}
        href={article.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all"
      >
        {article.thumbnail_url && (
          <img
            src={article.thumbnail_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">{tag}</span>
            ))}
          </div>
          <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
          {article.summary_ko && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{article.summary_ko}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {article.source_name} · {article.published_at ? new Date(article.published_at).toLocaleDateString('ko-KR') : ''}
          </p>
        </div>
      </a>
    ))}
    {articles.length === 0 && (
      <p className="text-center text-sm text-gray-400 py-12">기사 데이터를 불러오는 중입니다. 관리자가 새로고침을 실행해 주세요.</p>
    )}
  </div>
)}
```

- [ ] **Step 3: EventsClient 상단에 훅 추가**

```typescript
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'
```

컴포넌트 내부:

```typescript
const { data: eventArticles = [], isLoading: isEventsLoading } = useMarketArticles({ category: 'events', limit: 20 })
```

- [ ] **Step 4: EventsClient — 이벤트 목록 실데이터 교체**

이벤트 카드가 렌더링되는 섹션 찾아 교체:

```typescript
{isEventsLoading ? (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {eventArticles.map((article: MarketArticle) => (
      <a
        key={article.id}
        href={article.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="text-xs text-gray-400">
            {article.published_at ? new Date(article.published_at).toLocaleDateString('ko-KR') : '날짜 미상'}
          </span>
        </div>
        <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
        {article.key_insight && (
          <p className="text-xs text-gray-500 line-clamp-2">{article.key_insight}</p>
        )}
        <span className="mt-auto text-xs text-gray-400">{article.source_name}</span>
      </a>
    ))}
    {eventArticles.length === 0 && (
      <p className="col-span-3 text-center text-sm text-gray-400 py-12">이벤트 데이터를 불러오는 중입니다.</p>
    )}
  </div>
)}
```

- [ ] **Step 5: 커밋**

```bash
git add src/app/market/_components/TechAiClient.tsx \
        src/app/market/_components/EventsClient.tsx
git commit -m "feat: TechAiClient + EventsClient 실데이터 연결 + Skeleton 로딩"
```

---

## Task 14: Market UI — InfluencerClient 실데이터 + 관리자 새로고침 버튼

**Files:**
- Modify: `src/app/market/_components/InfluencerClient.tsx`
- Modify: `src/app/market/page.tsx` (새로고침 버튼)

- [ ] **Step 1: InfluencerClient 훅 연결**

```typescript
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'
```

컴포넌트 내부:

```typescript
const { data: kolArticles = [], isLoading: isKolLoading } = useMarketArticles({ category: 'marketing_kol', limit: 20 })
```

- [ ] **Step 2: KOL 카드 섹션 실데이터로 교체**

KOL 리스트 섹션을 찾아 교체:

```typescript
{isKolLoading ? (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {[1,2,3,4].map(i => (
      <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {kolArticles.map((article: MarketArticle) => (
      <a
        key={article.id}
        href={article.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-pink-200 hover:shadow-sm transition-all"
      >
        {article.thumbnail_url && (
          <img src={article.thumbnail_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{article.source_name}</p>
          {article.key_insight && (
            <p className="mt-1 text-xs text-gray-400 line-clamp-1">💡 {article.key_insight}</p>
          )}
        </div>
      </a>
    ))}
  </div>
)}
```

- [ ] **Step 3: 관리자 수동 새로고침 버튼 추가**

`src/app/market/page.tsx` (또는 레이아웃 헤더 영역)에 관리자 전용 새로고침 버튼 추가. page.tsx를 서버 컴포넌트로 두고, 새로고침 버튼은 별도 클라이언트 컴포넌트로 분리:

```typescript
// src/app/market/_components/MarketRefreshButton.tsx
'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function MarketRefreshButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleRefresh() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/market/refresh', { method: 'POST' })
      const data = (await res.json()) as { articlesSaved?: number; error?: string }
      setResult(res.ok ? `✓ ${data.articlesSaved}개 저장 완료` : `✗ ${data.error}`)
    } catch {
      setResult('✗ 네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? '갱신 중...' : '수동 새로고침'}
      </button>
      {result && <span className="text-xs text-gray-500">{result}</span>}
    </div>
  )
}
```

`MarketNav.tsx` 또는 market layout.tsx 헤더에 `<MarketRefreshButton />` 추가 (관리자만 보이도록 role 체크는 페이지 레벨에서 처리).

- [ ] **Step 4: 커밋**

```bash
git add src/app/market/_components/InfluencerClient.tsx \
        src/app/market/_components/MarketRefreshButton.tsx
git commit -m "feat: InfluencerClient KOL 실데이터 + 관리자 수동 새로고침 버튼"
```

---

## Task 15: SomeContent — claude-analysis API 라우트

**Files:**
- Create: `src/app/api/some-content/claude-analysis/route.ts`

- [ ] **Step 1: claude-analysis/route.ts 생성**

```typescript
// src/app/api/some-content/claude-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { claude, MODEL_INSIGHT } from '@/lib/claude'
import {
  SOME_CONTENT_SYSTEM_PROMPT,
  buildInsightPrompt,
  buildCrossChannelPrompt,
  type InsightInput,
  type CrossChannelInput,
  type InsightOutput,
  type CrossChannelOutput,
} from '@/lib/prompts/some-content'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as InsightInput & CrossChannelInput & { keyword_id: string }
  const { keyword_id, keyword } = body
  if (!keyword_id || !keyword) return NextResponse.json({ error: 'keyword_id, keyword 필요' }, { status: 400 })

  const [insightRes, crossRes] = await Promise.allSettled([
    claude.messages.create({
      model: MODEL_INSIGHT,
      max_tokens: 1500,
      system: SOME_CONTENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildInsightPrompt(body as InsightInput) }],
    }),
    claude.messages.create({
      model: MODEL_INSIGHT,
      max_tokens: 1500,
      system: SOME_CONTENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildCrossChannelPrompt(body as CrossChannelInput) }],
    }),
  ])

  const parseText = <T>(res: PromiseSettledResult<{ content: { type: string; text: string }[]; usage: { input_tokens: number; output_tokens: number } }>): T | null => {
    if (res.status !== 'fulfilled') return null
    try {
      const text = res.value.content[0].type === 'text' ? res.value.content[0].text.trim() : ''
      return JSON.parse(text) as T
    } catch { return null }
  }

  const insightPayload = parseText<InsightOutput>(insightRes)
  const crossPayload = parseText<CrossChannelOutput>(crossRes)

  const totalTokens =
    (insightRes.status === 'fulfilled' ? insightRes.value.usage.input_tokens + insightRes.value.usage.output_tokens : 0) +
    (crossRes.status === 'fulfilled' ? crossRes.value.usage.input_tokens + crossRes.value.usage.output_tokens : 0)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  // 기존 캐시 삭제 후 신규 저장
  await supabase.from('sc_claude_insights').delete().eq('keyword_id', keyword_id)

  const rows = [
    insightPayload && { keyword_id, keyword, insight_type: 'comprehensive', payload: insightPayload, token_used: totalTokens, expires_at: expiresAt.toISOString() },
    crossPayload && { keyword_id, keyword, insight_type: 'cross_channel', payload: crossPayload, token_used: totalTokens, expires_at: expiresAt.toISOString() },
  ].filter(Boolean)

  if (rows.length) await supabase.from('sc_claude_insights').insert(rows)

  return NextResponse.json({
    insight: insightPayload,
    cross_channel: crossPayload,
    generated_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    tokens: totalTokens,
  })
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/api/some-content/claude-analysis/route.ts
git commit -m "feat: SomeContent Claude Sonnet 심층 분석 API"
```

---

## Task 16: SomeContent insights 라우트 — Groq → Claude 교체

**Files:**
- Modify: `src/app/api/some-content/insights/route.ts`

- [ ] **Step 1: 기존 파일 전체 교체**

기존 Groq 호출을 Claude로 교체. 응답 구조(`InsightsResult`)는 동일하게 유지하여 클라이언트 코드 변경 없음:

```typescript
// src/app/api/some-content/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { claude, MODEL_INSIGHT } from '@/lib/claude'
import { SOME_CONTENT_SYSTEM_PROMPT, buildInsightPrompt } from '@/lib/prompts/some-content'

export interface InsightsResult {
  trend_summary: string
  opportunities: string[]
  risks: string[]
  recommendations: string[]
  generated_by?: 'claude' | 'groq_fallback'
  generated_at?: string
}

const CACHE = new Map<string, { data: InsightsResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000   // 1시간 인메모리 캐시 (sc_claude_insights와 별개)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    keyword: string
    keyword_id?: string
    metrics?: { trend: string; growthRate: number; volatility: number; avg: number; recent3Avg: number; maxMonth: string; minMonth: string }
    sentimentSummary?: string
    positive?: { word: string; weight: number }[]
    negative?: { word: string; weight: number }[]
    mentionsByChannel?: Record<string, number>
  }

  const { keyword, metrics, positive, negative, mentionsByChannel, keyword_id } = body
  if (!keyword) return NextResponse.json({ error: 'keyword 필요' }, { status: 400 })

  const cacheKey = `${keyword}:${metrics?.trend}:${metrics?.growthRate}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return NextResponse.json(cached.data)

  // sc_claude_insights 캐시 우선 조회
  if (keyword_id) {
    const { data: cachedInsight } = await supabase
      .from('sc_claude_insights')
      .select('payload, expires_at')
      .eq('keyword_id', keyword_id)
      .eq('insight_type', 'comprehensive')
      .gt('expires_at', new Date().toISOString())
      .single()
    if (cachedInsight?.payload) {
      const result = { ...(cachedInsight.payload as InsightsResult), generated_by: 'claude' as const }
      CACHE.set(cacheKey, { data: result, ts: Date.now() })
      return NextResponse.json(result)
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY 미설정' }, { status: 503 })
  }

  const topKeywords = [
    ...(positive ?? []).slice(0, 8).map(w => w.word),
    ...(negative ?? []).slice(0, 5).map(w => w.word),
  ]

  try {
    const message = await claude.messages.create({
      model: MODEL_INSIGHT,
      max_tokens: 1000,
      system: SOME_CONTENT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildInsightPrompt({
          keyword,
          mentionsByChannel: mentionsByChannel ?? {},
          sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
          topKeywords,
          metrics,
        }),
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const parsed = JSON.parse(text) as InsightsResult

    const result: InsightsResult = {
      trend_summary: parsed.trend_summary ?? '',
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      generated_by: 'claude',
      generated_at: new Date().toISOString(),
    }

    CACHE.set(cacheKey, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch {
    // Claude 실패 시 Groq 폴백
    try {
      const groqKey = process.env.GROQ_API_KEY
      if (!groqKey) throw new Error('no groq key')
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.35,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SOME_CONTENT_SYSTEM_PROMPT },
            { role: 'user', content: buildInsightPrompt({ keyword, mentionsByChannel: mentionsByChannel ?? {}, sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }, topKeywords }) },
          ],
          max_tokens: 900,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error('groq failed')
      const json = (await res.json()) as { choices: { message: { content: string } }[] }
      const parsed = JSON.parse(json.choices[0]?.message?.content ?? '{}') as InsightsResult
      const result: InsightsResult = {
        trend_summary: parsed.trend_summary ?? '',
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        generated_by: 'groq_fallback',
        generated_at: new Date().toISOString(),
      }
      CACHE.set(cacheKey, { data: result, ts: Date.now() })
      return NextResponse.json(result)
    } catch {
      return NextResponse.json({ error: 'AI 분석 서비스 일시 불가' }, { status: 503 })
    }
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/api/some-content/insights/route.ts
git commit -m "feat: SomeContent insights — Groq → Claude Sonnet 교체 (Groq 폴백 유지)"
```

---

## Task 17: SomeContent sync 라우트 — Claude 자동 트리거

**Files:**
- Modify: `src/app/api/some-content/mentions/sync/route.ts`

- [ ] **Step 1: sync 완료 후 claude-analysis 자동 호출 추가**

`src/app/api/some-content/mentions/sync/route.ts`의 `POST` 함수 마지막 `return NextResponse.json(...)` 바로 위에 추가:

```typescript
  // ── sync 완료 후 Claude 분석 자동 트리거 ─────────────────────
  // 백그라운드 실행 (await 없음 — sync 응답 지연 방지)
  void triggerClaudeAnalysis(keywords ?? [], supabase)

  return NextResponse.json({
    synced,
    total: keywords.length,
    youtube_real: !!ytKey,
    synced_at: new Date().toISOString(),
  })
}

// ── 헬퍼: 키워드별 Claude 분석 트리거 ────────────────────────────
async function triggerClaudeAnalysis(
  keywords: { id: string; keyword: string }[],
  supabase: Awaited<ReturnType<typeof import('@/utils/supabase/server').createServerClient>>,
) {
  for (const kw of keywords) {
    try {
      // 채널별 언급량 집계
      const today = new Date().toISOString().split('T')[0]
      const { data: mentions } = await supabase
        .from('sc_mentions')
        .select('channel, count')
        .eq('keyword_id', kw.id)
        .eq('mention_date', today)

      const mentionsByChannel = Object.fromEntries(
        (mentions ?? []).map(m => [m.channel as string, m.count as number]),
      )

      // 최신 포스트 10개
      const { data: posts } = await supabase
        .from('sc_posts')
        .select('channel, content, sentiment')
        .eq('keyword_id', kw.id)
        .order('fetched_at', { ascending: false })
        .limit(10)

      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/some-content/claude-analysis`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword_id: kw.id,
            keyword: kw.keyword,
            mentionsByChannel,
            sentimentDistribution: { positive: 33, negative: 17, neutral: 50 },
            topKeywords: [],
            trendData: null,
            mentionSummary: mentionsByChannel,
            topPosts: (posts ?? []).map(p => ({
              channel: p.channel as string,
              content: (p.content as string | null) ?? '',
              sentiment: p.sentiment as string | null,
            })),
          }),
        },
      )
    } catch {
      // 키워드별 Claude 실패 무시 — sync 결과에 영향 없음
    }
  }
}
```

> **중요:** `triggerClaudeAnalysis` 함수의 `supabase` 타입 import가 필요. 파일 상단에 다음 추가:
> ```typescript
> import { createServerClient } from '@/utils/supabase/server'
> ```
> (이미 있으면 생략)

- [ ] **Step 2: 커밋**

```bash
git add src/app/api/some-content/mentions/sync/route.ts
git commit -m "feat: SomeContent sync 완료 후 Claude 분석 자동 트리거"
```

---

## Task 18: SomeContent UI — 탭 정리 + TrendAnalysisView Claude 배지 + 반응형

**Files:**
- Modify: `src/app/some-content/_components/SomeContentClient.tsx`
- Modify: `src/app/some-content/_components/TrendAnalysisView.tsx`

- [ ] **Step 1: SomeContentClient — Channel Explorer 탭 제거**

`SomeContentClient.tsx`에서 탭 정의 부분을 찾아 수정:

```typescript
// 변경 전 (4개 탭)
const TABS = ['dashboard', 'trend', 'channels', 'settings'] as const
type Tab = typeof TABS[number]

// 변경 후 (3개 탭)
const TABS = ['dashboard', 'trend', 'settings'] as const
type Tab = typeof TABS[number]
```

탭 버튼 렌더링 부분에서 `channels` 탭 버튼 제거.

- [ ] **Step 2: Channel Explorer 콘텐츠를 Dashboard 탭 하단 아코디언으로 통합**

`tab === 'dashboard'` 렌더링 섹션 하단에 채널별 상세 아코디언 추가:

```typescript
{/* 채널별 상세 — 아코디언 */}
<details className="mt-6 rounded-xl border border-gray-200 bg-white">
  <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 list-none flex items-center justify-between">
    <span>채널별 상세 언급량</span>
    <ChevronDown className="h-4 w-4 text-gray-400" />
  </summary>
  <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
    {Object.entries(mentions[0]?.by_channel ?? {}).map(([channel, count]) => (
      <div key={channel} className="rounded-lg bg-gray-50 p-3 text-center">
        <p className="text-xs text-gray-500 truncate">{CHANNEL_META[channel as keyof typeof CHANNEL_META]?.label ?? channel}</p>
        <p className="mt-1 text-lg font-bold text-gray-900">{(count as number).toLocaleString()}</p>
      </div>
    ))}
  </div>
</details>
```

필요 import 추가: `import { ChevronDown } from 'lucide-react'`

- [ ] **Step 3: TrendAnalysisView — 엔드포인트 교체 + Claude 배지**

`TrendAnalysisView.tsx`에서 insights fetch 부분을 찾아 수정:

```typescript
// 변경 전
const res = await fetch('/api/some-content/insights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keyword, metrics, sentimentSummary, positive, negative }),
})

// 변경 후
const res = await fetch('/api/some-content/insights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyword,
    keyword_id: keywordId,   // prop으로 전달받거나 상태에서 가져옴
    metrics,
    sentimentSummary,
    positive,
    negative,
    mentionsByChannel,
  }),
})
```

인사이트 패널 헤더에 Claude 배지 추가:

```typescript
{/* 인사이트 패널 헤더 */}
<div className="flex items-center justify-between mb-4">
  <h3 className="text-sm font-semibold text-gray-900">AI 종합 인사이트</h3>
  {insights && (
    <span className={[
      'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
      insights.generated_by === 'groq_fallback'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-violet-50 text-violet-700',
    ].join(' ')}>
      {insights.generated_by === 'groq_fallback' ? '⚠ 기본 분석 모드' : '✦ Claude 분석'}
      {insights.generated_at && (
        <span className="text-gray-400">
          · {Math.round((Date.now() - new Date(insights.generated_at).getTime()) / 60000)}분 전
        </span>
      )}
    </span>
  )}
</div>
```

- [ ] **Step 4: 반응형 — 인사이트 패널 모바일 아코디언**

인사이트의 기회·리스크·추천 섹션을 모바일에서 아코디언으로 처리:

```typescript
<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {/* 기회 */}
  <div className="rounded-xl bg-emerald-50 p-4">
    <p className="mb-2 text-xs font-semibold text-emerald-700">기회요인</p>
    <ul className="space-y-1">
      {insights.opportunities.map((op, i) => (
        <li key={i} className="text-xs text-emerald-800">• {op}</li>
      ))}
    </ul>
  </div>
  {/* 리스크 */}
  <div className="rounded-xl bg-rose-50 p-4">
    <p className="mb-2 text-xs font-semibold text-rose-700">리스크</p>
    <ul className="space-y-1">
      {insights.risks.map((r, i) => (
        <li key={i} className="text-xs text-rose-800">• {r}</li>
      ))}
    </ul>
  </div>
  {/* 추천 */}
  <div className="rounded-xl bg-blue-50 p-4">
    <p className="mb-2 text-xs font-semibold text-blue-700">추천 액션</p>
    <ul className="space-y-1">
      {insights.recommendations.map((rec, i) => (
        <li key={i} className="text-xs text-blue-800">• {rec}</li>
      ))}
    </ul>
  </div>
</div>
```

- [ ] **Step 5: 마인드맵 모바일 폴백 추가**

`TrendAnalysisView.tsx` 또는 `KeywordMindMap.tsx`가 렌더링되는 부분에 모바일 폴백 추가:

```typescript
{/* 마인드맵 — 모바일: 리스트 폴백 */}
<div className="hidden md:block">
  <KeywordMindMap nodes={mindmapNodes} keyword={mindmapKeyword} />
</div>
<div className="block md:hidden rounded-xl border border-gray-100 bg-white p-4">
  <p className="mb-3 text-xs font-medium text-gray-500">연관 키워드 (PC에서 마인드맵 전체 보기)</p>
  <div className="flex flex-wrap gap-2">
    {mindmapNodes.slice(0, 15).map(node => (
      <span key={node.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
        {node.keyword}
      </span>
    ))}
  </div>
</div>
```

- [ ] **Step 6: 커밋**

```bash
git add src/app/some-content/_components/SomeContentClient.tsx \
        src/app/some-content/_components/TrendAnalysisView.tsx
git commit -m "feat: SomeContent 탭 3개 정리 + Claude 배지 + 마인드맵 모바일 폴백"
```

---

## Task 19: 최종 검증

- [ ] **Step 1: 로컬 서버 기동**

```bash
npm run dev
```

- [ ] **Step 2: 시장조사 파이프라인 수동 실행 테스트**

```bash
# 관리자 계정으로 로그인 후 쿠키를 환경변수에 저장해서 실행
curl -s -X POST http://localhost:3000/api/market/refresh \
  -H "x-cron-secret: $CRON_SECRET" | python -m json.tool
```

Expected: `{"success":true,"articlesFetched":N,"articlesSaved":M,"claudeTokens":K}`

- [ ] **Step 3: 시장조사 UI 확인**

브라우저에서 `/market` 접속:
- Daily Report: 실 기사 목록 렌더링 확인 (목데이터 미노출)
- 탭이 4개인지 확인 (Competitors 없음)
- 모바일 (375px) 뷰포트에서 탭 스크롤 동작 확인

- [ ] **Step 4: 썸콘텐츠 sync → Claude 자동 트리거 확인**

`/some-content` → sync 실행 → TrendAnalysisView에서 인사이트 패널에 "✦ Claude 분석" 배지 확인

- [ ] **Step 5: Claude 오류 폴백 확인**

`.env.local`에서 `ANTHROPIC_API_KEY`를 임시로 잘못된 값으로 변경 후:
- 시장조사: `/market` 접속 시 기존 캐시 데이터 표시 확인
- 썸콘텐츠: insights 호출 시 "⚠ 기본 분석 모드" 배지 + Groq 결과 표시 확인
- 원래 키로 복원

- [ ] **Step 6: 마지막 커밋**

```bash
git add -A
git commit -m "feat: Claude API 파이프라인 고도화 완료 — 시장조사 실데이터 + SomeContent Sonnet 인사이트"
```

---

## 완료 기준 체크리스트

- [ ] 시장조사 전 섹션(Daily/Tech&AI/Events/KOL)이 실데이터 기반 렌더링
- [ ] Claude Haiku가 각 기사에 신뢰도 스코어 + 한국어 요약 + 우선순위 배정
- [ ] Vercel Cron 매일 09:00 KST 자동 실행 + `market_refresh_logs` 기록
- [ ] 시장조사 탭 4개 (Competitors 제거 완료)
- [ ] 썸콘텐츠 인사이트가 Claude Sonnet 기반 (Groq 폴백 유지)
- [ ] sync 완료 후 Claude 분석 자동 트리거
- [ ] Claude 오류 시 폴백 동작 정상
- [ ] 썸콘텐츠 탭 3개 (Channel Explorer → Dashboard 아코디언)
- [ ] 마인드맵 모바일 폴백 + 채널 그리드 반응형 적용
- [ ] 관리자 수동 새로고침 버튼 동작
