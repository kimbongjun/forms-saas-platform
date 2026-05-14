# Claude API 파이프라인 고도화 설계 스펙

**날짜:** 2026-05-14
**대상:** 썸콘텐츠(`/some-content`) · 시장조사(`/market`)
**목표:** Claude API를 활용하여 콘텐츠 양·품질·신뢰성 전면 고도화

---

## 1. 배경 및 현황 분석

### 1-1. 썸콘텐츠 현황

| 항목 | 내용 |
|---|---|
| 경로 | `/some-content` |
| 주요 컴포넌트 | `SomeContentClient.tsx` (1,107줄) · `TrendAnalysisView.tsx` (536줄) · `KeywordMindMap.tsx` (401줄) |
| 데이터 수집 | 14채널 (Naver Blog/Cafe/News 실API · 7개 커뮤니티 크롤링 · Instagram/X/Facebook 추정치) |
| 현재 AI | **Groq + Llama 3.3** — 감성 태깅, 트렌드 요약, 인사이트 생성 |
| 탭 구조 | Dashboard · Trend Analysis · Channel Explorer · Settings (4개) |
| 문제점 | 일일 쿼터 제한 · 한국어 분석 품질 한계 · Channel Explorer 탭 콘텐츠 밀도 부족 |

### 1-2. 시장조사(Market) 현황

| 항목 | 내용 |
|---|---|
| 경로 | `/market` |
| 주요 컴포넌트 | `DailyReportClient.tsx` · `TechAiClient.tsx` · `EventsClient.tsx` · `InfluencerClient.tsx` |
| 시각화 | Three.js 3D 글로브 · D3.js 세계지도 · Recharts |
| 탭 구조 | Daily Report · Competitors · Tech & AI · KOL & Campaigns · Events (5개) |
| 문제점 | **전 섹션 하드코딩 목데이터** · AI 연동 전무 · `/market/competitors` 라우트 미존재 |

---

## 2. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED INFRASTRUCTURE                     │
│  src/lib/claude.ts  (Anthropic SDK 클라이언트 싱글톤)         │
│  src/lib/prompts/market.ts  ·  src/lib/prompts/some-content.ts│
│  ANTHROPIC_API_KEY (신규 환경변수)                            │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│  시장조사 파이프라인  │    │       썸콘텐츠 파이프라인          │
│                      │    │                                  │
│  RSS + Naver +       │    │  14채널 실시간 수집               │
│  Google News +       │    │       ↓                          │
│  YouTube             │    │  Groq: 감성 태깅 (실시간 유지)    │
│       ↓              │    │       ↓                          │
│  Claude (Haiku)      │    │  Claude (Sonnet): 심층 분석       │
│  · 신뢰도 스코어링   │    │  — 트렌드 요약 내러티브           │
│  · 우선순위 결정     │    │  — 크로스채널 인사이트            │
│  · 한국어 요약       │    │  — 기회·리스크·추천 액션          │
│  · 카테고리 태깅     │    │       ↓                          │
│       ↓              │    │  sc_claude_insights (Supabase)   │
│  market_articles     │    │  sync 완료 후 자동 트리거         │
│  (Supabase)          │    │                                  │
│  Vercel Cron         │    │                                  │
│  매일 09:00 KST      │    │                                  │
└──────────────────────┘    └──────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│              클라이언트 컴포넌트 (UI 변경 최소화)              │
│  MarketNav · DailyReportClient · TechAiClient ···            │
│  TrendAnalysisView · SomeContentClient                       │
└─────────────────────────────────────────────────────────────┘
```

**핵심 원칙:**
- 두 파이프라인 완전 독립 — 어느 쪽 장애도 상대방에 무영향
- Claude는 생성이 아닌 **검증·변환·합성** 역할 (hallucination 최소화)
- 기존 컴포넌트 UI는 변경 없이 데이터 레이어만 실데이터로 교체

---

## 3. 시장조사 파이프라인 상세

### 3-1. 데이터 소스

| 소스 | 타깃 섹션 | 수집 방식 | 활용 환경변수 |
|---|---|---|---|
| RSS Feeds (국내 IT·의료·마케팅 언론) | Daily Report, Tech & AI | `feed-parser` 라이브러리 | — |
| Naver 뉴스 검색 API | Daily Report, Competitors 흡수분 | 기존 Naver API 재사용 | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` |
| Google News RSS | Tech & AI, Events | XML fetch + 파싱 | — |
| YouTube Data API | KOL & Campaigns | 기존 YouTube API 재사용 | `YOUTUBE_API_KEY` |

### 3-2. Claude 검증·우선순위 모델

수집된 원문 기사를 Claude(Haiku)에 배치 전달 → 4축 평가:

```
신뢰도 스코어 (0~100)
  └ source_credibility  : 출처 도메인 공신력 (30점)
  └ recency_score       : 발행일 기준 신선도 (25점)
  └ relevance_score     : 산업 관련성 (30점)
  └ novelty_score       : 중복·반복 여부 (15점)

priority_tier
  └ TOP      : 80점 이상 → Daily Report 상단 노출
  └ STANDARD : 50~79점  → 섹션별 본문 리스트
  └ LOW      : 49점 이하 → 필터 제외 (DB 저장만)
```

Claude 출력 포맷 (structured JSON):
```json
{
  "credibility_score": 84,
  "priority_tier": "TOP",
  "category": "tech_ai",
  "summary_ko": "3문장 한국어 요약",
  "key_insight": "핵심 시사점 1줄",
  "tags": ["AI", "헬스케어", "규제"]
}
```

### 3-3. DB 스키마 (신규)

```sql
-- 수집·검증된 기사 저장
CREATE TABLE market_articles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type   text NOT NULL,   -- 'rss' | 'naver' | 'google_news' | 'youtube'
  category      text NOT NULL,   -- 'tech_ai' | 'marketing_kol' | 'events' | 'daily'
  title         text NOT NULL,
  summary_ko    text,            -- Claude 생성 한국어 요약 (3문장)
  key_insight   text,            -- Claude 핵심 시사점 1줄
  original_url  text NOT NULL,
  source_name   text,
  thumbnail_url text,
  published_at  timestamptz,
  credibility_score int,         -- 0~100
  priority_tier text,            -- 'top' | 'standard' | 'low'
  tags          text[],
  fetched_at    timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

-- 갱신 실행 이력
CREATE TABLE market_refresh_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by     text,             -- 'cron' | 'admin'
  articles_fetched int,
  articles_saved   int,
  claude_tokens_used int,
  status           text,             -- 'success' | 'partial' | 'failed'
  error_detail     text,
  created_at       timestamptz DEFAULT now()
);
```

### 3-4. API 라우트

```
/api/market/ingest    POST  — 소스별 기사 수집 + 정규화
/api/market/analyze   POST  — Claude 검증·요약·우선순위 배정
/api/market/refresh   POST  — ingest → analyze 전체 파이프라인 (Cron + 수동 트리거)
/api/market/articles  GET   — 클라이언트 서빙 (category·tier 필터 지원)
```

기존 `/api/market/articles/route.ts` · `/api/market/refresh/route.ts`는 미구현 상태이므로 실 구현으로 채운다.

### 3-5. 갱신 주기

| 방식 | 스케줄 | 엔드포인트 |
|---|---|---|
| Vercel Cron 자동 | 매일 09:00 KST (`0 0 * * *` UTC) | `/api/market/refresh` |
| 관리자 수동 | 필요 시 버튼 클릭 | 동일 |

Cron 요청 보안: `CRON_SECRET` 환경변수 헤더 검증으로 외부 무단 호출 차단.

캐시 TTL: `market_articles`는 24시간 유효. 오류 시 최대 48시간 연장 서빙.

---

## 4. 썸콘텐츠 파이프라인 상세

### 4-1. AI 역할 분리

| 작업 | 담당 | 타이밍 | 이유 |
|---|---|---|---|
| 포스트별 감성 태깅 (pos/neg/neu) | **Groq** (유지) | 수집 직후 실시간 | 빠른 레이블링, 건당 짧은 토큰 |
| 워드클라우드 키워드 추출 | **Groq** (유지) | 수집 직후 실시간 | 현재 안정적으로 작동 중 |
| 트렌드 요약 내러티브 | **Claude Sonnet** (신규) | sync 완료 후 배치 | 12개월 데이터 종합, 긴 컨텍스트 필요 |
| 크로스채널 종합 인사이트 | **Claude Sonnet** (신규) | sync 완료 후 배치 | 14채널 데이터 교차 분석 |
| 기회·리스크·추천 액션 | **Claude Sonnet** (교체) | sync 완료 후 배치 | 기존 Groq `/api/some-content/insights` 대체 |
| 소비자 반응 패턴 분석 | **Claude Sonnet** (신규) | 주 1회 배치 | 누적 데이터 기반 심층 분석 |

### 4-2. 변경 대상 API 라우트

```
[교체]
/api/some-content/insights/route.ts
  Groq(llama-3.3) → Claude(claude-sonnet-4-6)
  입력: 채널별 mention 수 + 감성 분포 + 상위 키워드
  출력: { trend_summary, opportunities[], risks[], recommendations[] }

[신규]
/api/some-content/claude-analysis/route.ts
  트렌드 + 크로스채널 통합 분석
  입력: 12개월 trendData + 14채널 mentionSummary + topPosts[]
  출력: { narrative, channel_insights, consumer_pattern, priority_keywords[] }

[유지]
/api/some-content/sentiment/route.ts  → Groq 그대로
/api/some-content/trend/route.ts      → 데이터 수집만, 요약은 Claude로 이동
```

### 4-3. Claude 인사이트 캐시 스키마 (신규)

```sql
CREATE TABLE sc_claude_insights (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id   uuid REFERENCES sc_keywords(id) ON DELETE CASCADE,
  keyword      text NOT NULL,
  insight_type text NOT NULL,  -- 'comprehensive' | 'trend' | 'cross_channel'
  payload      jsonb NOT NULL, -- Claude 응답 전체
  token_used   int,
  model        text DEFAULT 'claude-sonnet-4-6',
  generated_at timestamptz DEFAULT now(),
  expires_at   timestamptz    -- generated_at + 24h
);
```

### 4-4. 트리거 흐름

```
사용자 "sync 실행" 클릭
  → POST /api/some-content/mentions/sync   (기존)
  → POST /api/some-content/posts/crawl     (기존)
  → 완료 콜백
  → POST /api/some-content/claude-analysis (신규 자동 트리거)
       Claude Sonnet 분석 (약 10~20초)
  → sc_claude_insights 저장
  → TrendAnalysisView React Query invalidation → 자동 갱신
```

### 4-5. TrendAnalysisView 변경 범위

UI 변경 없이 엔드포인트만 교체:

```typescript
// 변경 전
const res = await fetch('/api/some-content/insights', { method: 'POST', ... })

// 변경 후
const res = await fetch('/api/some-content/claude-analysis', { method: 'POST', ... })
// 응답 구조 동일하게 맞춰 UI 수정 불필요
```

인사이트 패널 상단에 **"Claude 분석 · 생성 N분 전"** 배지 표시 (신뢰도 시각화).

---

## 5. 공유 인프라

### 5-1. Claude SDK 클라이언트 (`src/lib/claude.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 시장조사: 배치 처리 (속도·비용 최적)
export const MODEL_BATCH = 'claude-haiku-4-5-20251001'

// 썸콘텐츠: 심층 인사이트 (품질 최적)
export const MODEL_INSIGHT = 'claude-sonnet-4-6'
```

### 5-2. 프롬프트 파일

| 파일 | 용도 |
|---|---|
| `src/lib/prompts/market.ts` | 기사 검증·요약·카테고리 분류 프롬프트 |
| `src/lib/prompts/some-content.ts` | 트렌드 요약·크로스채널 인사이트·기회/리스크 프롬프트 |

두 파일 모두 system prompt + 입력 빌더 함수 패턴으로 구성.

### 5-3. 에러 핸들링 & 폴백

```
Claude API 오류 시
  ├─ 시장조사 → 이전 캐시 데이터 서빙 (최대 48h 연장)
  │              market_refresh_logs에 'partial' 기록
  └─ 썸콘텐츠 → Groq insights 자동 폴백
                 UI에 "⚠ 기본 분석 모드" 배지 표시
```

### 5-4. 환경변수

```env
# 신규 추가
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=...          # Cron 엔드포인트 보안 토큰

# 기존 유지
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
NAVER_AD_CUSTOMER_ID=...
NAVER_AD_ACCESS_LICENSE=...
NAVER_AD_SECRET_KEY=...
GROQ_API_KEY=...
YOUTUBE_API_KEY=...
```

### 5-5. Vercel Cron 설정 (`vercel.json`)

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

---

## 6. 탭 메뉴 정리

### 6-1. 시장조사 (5탭 → 4탭)

| 현재 | 변경 | 이유 |
|---|---|---|
| Daily Report | ✅ 유지 | |
| **Competitors** | ❌ **제거** | 라우트 미존재. 경쟁사 기사는 Daily Report TOP 기사로 흡수 |
| Tech & AI | ✅ 유지 | |
| KOL & Campaigns | ✅ 유지 | |
| Events | ✅ 유지 | |

### 6-2. 썸콘텐츠 (4탭 → 3탭)

| 현재 | 변경 | 이유 |
|---|---|---|
| Dashboard | ✅ 유지 | |
| Trend Analysis | ✅ 유지 | |
| **Channel Explorer** | ❌ **제거** | Dashboard 하단 "채널별 상세" 아코디언으로 통합 |
| Settings | ✅ 유지 | |

---

## 7. 반응형 UX/UI 최적화

### 7-1. 시장조사

| 요소 | 모바일 (< md) | 데스크탑 (≥ md) |
|---|---|---|
| GlobeViewer (Three.js) | 숨김 → 지역별 KPI 카드 2열 | 그대로 |
| WorldMap (D3.js) | 숨김 → 마켓 국가 리스트 | 그대로 |
| 기사 카드 | 1열 풀너비, 요약 2줄 클램프 | 2~3열 그리드 |
| 탭 내비 | 수평 스크롤 (`overflow-x: auto`) | 고정 가로 배치 |
| 새로고침 버튼 | FAB (우하단 고정) | 헤더 인라인 |
| 신선도 배지 | 카드 상단 `last updated` | 동일 |

### 7-2. 썸콘텐츠

| 요소 | 모바일 | 데스크탑 |
|---|---|---|
| 키워드 마인드맵 (SVG 1200px) | "PC에서 전체 보기" + 연관 키워드 리스트 폴백 | 그대로 |
| 채널 그리드 | 2열 | 4~7열 |
| 트렌드 차트 | 높이 220px, 터치 스크롤 | 높이 320px |
| 인사이트 패널 | 아코디언 (기회·리스크·추천) | 카드 3분할 |
| Claude 배지 | 인라인 `생성: N분 전` | 동일 |
| Export 버튼 | 숨김 → Settings 탭으로 이동 | 헤더 인라인 |

### 7-3. 공통

- 스켈레톤 로딩 (`animate-pulse`) — Claude 응답 대기 중 표시
- React Query 로딩 상태 → 기존 Spinner → 섹션별 Skeleton으로 교체
- Tailwind `container mx-auto px-4 sm:px-6 lg:px-8` 일관 적용

---

## 8. 구현 순서 (Phase별)

| Phase | 작업 | 예상 공수 |
|---|---|---|
| **1** | 공유 인프라 — `@anthropic-ai/sdk` 설치 · `claude.ts` · 프롬프트 파일 · Supabase 마이그레이션 | 2~3일 |
| **2** | 시장조사 파이프라인 — `/api/market/ingest · analyze · refresh · articles` · `vercel.json` Cron | 3~4일 |
| **3** | 시장조사 UI — 탭 4개 정리 · 실데이터 연결 · 관리자 새로고침 버튼 · 반응형 레이아웃 | 2일 |
| **4** | 썸콘텐츠 파이프라인 — `/api/some-content/claude-analysis` · insights 교체 · sync 자동 트리거 | 2~3일 |
| **5** | 썸콘텐츠 UI — 탭 3개 정리 · Claude 엔드포인트 교체 · Claude 배지 · 반응형 레이아웃 | 2일 |
| **6** | 검증·마무리 — 폴백 동작 확인 · Cron 시뮬레이션 · 모바일·태블릿 최종 점검 | 1일 |

**총 예상 공수: 12~15일**

---

## 9. 완료 기준

- [ ] 시장조사 전 섹션이 실데이터(RSS·Naver·Google News·YouTube) 기반으로 렌더링
- [ ] Claude가 각 기사에 신뢰도 스코어 + 한국어 요약 + 우선순위 배정
- [ ] Vercel Cron 매일 09:00 KST 자동 실행 및 `market_refresh_logs` 기록
- [ ] 썸콘텐츠 인사이트·트렌드 요약이 Claude Sonnet 기반으로 교체
- [ ] Groq는 감성 태깅·워드클라우드 역할만 유지
- [ ] Claude 오류 시 폴백 동작 정상 확인
- [ ] 시장조사 탭 4개, 썸콘텐츠 탭 3개로 정리 완료
- [ ] 모바일·태블릿 반응형 레이아웃 전 섹션 적용
