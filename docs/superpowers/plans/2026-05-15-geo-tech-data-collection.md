# GEO Tech 데이터 자동 수집 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하드코딩된 `geo-data.ts`의 Tech·AEO 지표를 Google PageSpeed Insights API + HTML Schema 크롤러 기반의 실시간 수집으로 교체하고, Vercel Cron 자동화 + "데이터 수집하기" 수동 버튼을 제공한다.

**Architecture:** `src/lib/geo/tech-collector.ts`에 순수 함수로 수집 로직을 분리(테스트 가능), Supabase `geo_tech_snapshots` 테이블에 저장, GeoClient는 Supabase 최신 스냅샷을 읽되 스냅샷이 없을 경우 기존 `GEO_DATA`로 폴백한다. 수집 트리거는 Vercel Cron(`/api/cron/geo-tech`)과 인증된 사용자의 수동 POST(`/api/geo/collect`) 두 경로를 모두 지원한다.

**Tech Stack:** Next.js 16 App Router · TypeScript · Vitest · Supabase (createAdminClient/createServerClient) · Google PageSpeed Insights API v5 · 브라우저 `fetch` (schema HTML 크롤링) · Vercel Cron

---

## 수집 가능한 지표 vs. 제외 지표

| 지표 | 방법 | 비고 |
|---|---|---|
| schema_types | HTML fetch → JSON-LD 파싱 | 무료, 완전 자동화 |
| faq_schema | 동 위 | |
| lcp_ms | PageSpeed Insights API | 무료 (400req/일) |
| cls | PageSpeed Insights API | |
| mobile_score | PageSpeed Insights API | |
| https | PageSpeed audit `is-on-https` | |
| sitemap | HEAD /sitemap.xml | |
| eeeat_score | 위 지표에서 계산 | 직접 API 없음, 공식 계산 |

---

## 파일 구조

| 상태 | 파일 | 역할 |
|---|---|---|
| Create | `src/lib/geo/tech-collector.ts` | 순수 수집 함수 (테스트 대상) |
| Create | `src/__tests__/lib/geo/tech-collector.test.ts` | Vitest 단위 테스트 |
| Create | `vitest.config.ts` | 테스트 설정 |
| Create | `src/app/api/cron/geo-tech/route.ts` | Vercel Cron 핸들러 |
| Create | `src/app/api/geo/collect/route.ts` | 수동 수집 트리거 |
| Create | `src/app/api/geo/tech-snapshot/route.ts` | 클라이언트에서 최신 데이터 조회 |
| Modify | `src/app/geo/_data/geo-data.ts` | BrandGeoData에 website_url 추가 |
| Modify | `src/app/geo/_components/GeoClient.tsx` | Supabase 읽기 + 수집 버튼 |
| Modify | `vercel.json` | geo-tech cron 추가 |
| SQL | (Supabase 대시보드에서 직접 실행) | geo_tech_snapshots 테이블 |

---

## Task 1: Vitest 설치 및 설정

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts 추가)

- [ ] **Step 1: Vitest 의존성 설치**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
```

Expected: `package.json`의 devDependencies에 4개 추가

- [ ] **Step 2: `vitest.config.ts` 생성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: `package.json`에 test 스크립트 추가**

`scripts` 섹션에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 더미 테스트로 설정 검증**

`src/__tests__/setup.test.ts` 생성:
```typescript
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: 테스트 실행 확인**

```bash
npm test
```

Expected 출력:
```
✓ src/__tests__/setup.test.ts (1)
  ✓ vitest setup > works

Test Files  1 passed (1)
Tests  1 passed (1)
```

- [ ] **Step 6: 더미 파일 삭제 후 커밋**

```bash
del src\__tests__\setup.test.ts
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test framework"
```

---

## Task 2: HTML Schema 파싱 TDD (parseSchemaTypes, parseFaqSchema)

**Files:**
- Create: `src/__tests__/lib/geo/tech-collector.test.ts` (이 Task에서 첫 번째 섹션 작성)
- Create: `src/lib/geo/tech-collector.ts` (이 Task에서 두 함수만 구현)

- [ ] **Step 1: 테스트 파일 생성 (실패하는 테스트)**

`src/__tests__/lib/geo/tech-collector.test.ts` 생성:
```typescript
import { describe, it, expect } from 'vitest'
import { parseSchemaTypes, parseFaqSchema } from '@/lib/geo/tech-collector'

describe('parseSchemaTypes', () => {
  it('단일 JSON-LD 블록에서 @type 추출', () => {
    const html = `<script type="application/ld+json">{"@type":"Organization","name":"Test"}</script>`
    expect(parseSchemaTypes(html)).toEqual(['Organization'])
  })

  it('복수 JSON-LD 블록 모두 처리', () => {
    const html = `
      <script type="application/ld+json">{"@type":"Product","name":"A"}</script>
      <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>
    `
    const result = parseSchemaTypes(html)
    expect(result).toContain('Product')
    expect(result).toContain('FAQPage')
  })

  it('JSON-LD 없으면 빈 배열 반환', () => {
    expect(parseSchemaTypes('<html><body>no schema</body></html>')).toEqual([])
  })

  it('malformed JSON-LD에서 오류 미발생', () => {
    const html = `<script type="application/ld+json">{invalid json here}</script>`
    expect(() => parseSchemaTypes(html)).not.toThrow()
    expect(parseSchemaTypes(html)).toEqual([])
  })

  it('중복 @type 제거', () => {
    const html = `
      <script type="application/ld+json">{"@type":"Organization"}</script>
      <script type="application/ld+json">{"@type":"Organization"}</script>
    `
    expect(parseSchemaTypes(html)).toEqual(['Organization'])
  })

  it('@graph 배열 내부 @type 추출', () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},{"@type":"BreadcrumbList"}]}</script>`
    const result = parseSchemaTypes(html)
    expect(result).toContain('WebPage')
    expect(result).toContain('BreadcrumbList')
  })

  it('@type이 배열인 경우 처리', () => {
    const html = `<script type="application/ld+json">{"@type":["Product","MedicalProcedure"]}</script>`
    const result = parseSchemaTypes(html)
    expect(result).toContain('Product')
    expect(result).toContain('MedicalProcedure')
  })
})

describe('parseFaqSchema', () => {
  it('FAQPage 스키마 있으면 true', () => {
    const html = `<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>`
    expect(parseFaqSchema(html)).toBe(true)
  })

  it('FAQPage 없으면 false', () => {
    const html = `<script type="application/ld+json">{"@type":"Product","name":"A"}</script>`
    expect(parseFaqSchema(html)).toBe(false)
  })

  it('JSON-LD 없으면 false', () => {
    expect(parseFaqSchema('<html><body></body></html>')).toBe(false)
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npm test
```

Expected: FAIL with `Cannot find module '@/lib/geo/tech-collector'`

- [ ] **Step 3: `src/lib/geo/tech-collector.ts` 생성 — 두 함수 구현**

```typescript
// src/lib/geo/tech-collector.ts

// ── HTML Schema 파싱 ──────────────────────────────────────────────────────────

function extractTypesFromValue(value: unknown, out: Set<string>): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach(item => extractTypesFromValue(item, out))
    return
  }
  const record = value as Record<string, unknown>
  if (typeof record['@type'] === 'string') {
    out.add(record['@type'])
  } else if (Array.isArray(record['@type'])) {
    record['@type'].forEach(t => { if (typeof t === 'string') out.add(t) })
  }
  for (const v of Object.values(record)) {
    extractTypesFromValue(v, out)
  }
}

export function parseSchemaTypes(html: string): string[] {
  const types = new Set<string>()
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const data: unknown = JSON.parse(match[1])
      extractTypesFromValue(data, types)
    } catch {
      // malformed JSON-LD — skip
    }
  }
  return Array.from(types)
}

export function parseFaqSchema(html: string): boolean {
  return parseSchemaTypes(html).includes('FAQPage')
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected:
```
✓ src/__tests__/lib/geo/tech-collector.test.ts (10)
  ✓ parseSchemaTypes > 단일 JSON-LD 블록에서 @type 추출
  ✓ parseSchemaTypes > 복수 JSON-LD 블록 모두 처리
  ... (모두 통과)

Test Files  1 passed (1)
Tests  10 passed (10)
```

- [ ] **Step 5: 커밋**

```bash
git add src/lib/geo/tech-collector.ts src/__tests__/lib/geo/tech-collector.test.ts
git commit -m "feat(geo): HTML schema parser TDD (parseSchemaTypes, parseFaqSchema)"
```

---

## Task 3: PageSpeed 파싱 + E-E-A-T 계산 TDD (parsePageSpeedResult, computeEeeatScore)

**Files:**
- Modify: `src/__tests__/lib/geo/tech-collector.test.ts` (테스트 섹션 추가)
- Modify: `src/lib/geo/tech-collector.ts` (두 함수 추가)

- [ ] **Step 1: 테스트 파일에 두 섹션 추가**

`src/__tests__/lib/geo/tech-collector.test.ts` 파일 **하단에** 추가:
```typescript
import { parsePageSpeedResult, computeEeeatScore } from '@/lib/geo/tech-collector'

// ── PageSpeed Insights API v5 응답 파싱 ────────────────────────────────────

const mockPsiGood = {
  lighthouseResult: {
    categories: { performance: { score: 0.78 } },
    audits: {
      'largest-contentful-paint': { numericValue: 2300 },
      'cumulative-layout-shift':  { numericValue: 0.08 },
      'is-on-https':              { score: 1 },
    },
  },
}

const mockPsiBad = {
  lighthouseResult: {
    categories: { performance: { score: 0.42 } },
    audits: {
      'largest-contentful-paint': { numericValue: 6500 },
      'cumulative-layout-shift':  { numericValue: 0.32 },
      'is-on-https':              { score: 0 },
    },
  },
}

describe('parsePageSpeedResult', () => {
  it('mobile_score는 score * 100 반올림', () => {
    expect(parsePageSpeedResult(mockPsiGood).mobile_score).toBe(78)
  })

  it('lcp_ms는 numericValue 정수 반올림', () => {
    expect(parsePageSpeedResult(mockPsiGood).lcp_ms).toBe(2300)
  })

  it('cls는 numericValue 소수점 3자리', () => {
    expect(parsePageSpeedResult(mockPsiGood).cls).toBeCloseTo(0.08, 2)
  })

  it('https: is-on-https score=1이면 true', () => {
    expect(parsePageSpeedResult(mockPsiGood).https).toBe(true)
  })

  it('https: is-on-https score=0이면 false', () => {
    expect(parsePageSpeedResult(mockPsiBad).https).toBe(false)
  })

  it('성능 저하 케이스 파싱', () => {
    const r = parsePageSpeedResult(mockPsiBad)
    expect(r.mobile_score).toBe(42)
    expect(r.lcp_ms).toBe(6500)
  })
})

// ── E-E-A-T 점수 계산 ────────────────────────────────────────────────────────

describe('computeEeeatScore', () => {
  it('모든 지표 최대 시 100', () => {
    const score = computeEeeatScore({
      mobile_score: 100,
      https:        true,
      sitemap:      true,
      schema_types: ['Product', 'FAQPage', 'Organization', 'BreadcrumbList', 'WebPage'],
      faq_schema:   true,
    })
    expect(score).toBe(100)
  })

  it('모든 지표 0/false 시 0', () => {
    const score = computeEeeatScore({
      mobile_score: 0,
      https:        false,
      sitemap:      false,
      schema_types: [],
      faq_schema:   false,
    })
    expect(score).toBe(0)
  })

  it('일반적인 케이스 계산 검증 (mobile=80, https, sitemap, 2 schemas, faq)', () => {
    // mobile: round(80*0.30)=24, https:20, sitemap:10, schemas:2*7=14, faq:5 → 73
    const score = computeEeeatScore({
      mobile_score: 80,
      https:        true,
      sitemap:      true,
      schema_types: ['Product', 'FAQPage'],
      faq_schema:   true,
    })
    expect(score).toBe(73)
  })

  it('100 초과 시 100으로 클램핑', () => {
    const score = computeEeeatScore({
      mobile_score: 100,
      https:        true,
      sitemap:      true,
      schema_types: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      faq_schema:   true,
    })
    expect(score).toBeLessThanOrEqual(100)
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npm test
```

Expected: FAIL with `parsePageSpeedResult is not exported` (함수 없음)

- [ ] **Step 3: `tech-collector.ts`에 두 함수 추가**

`src/lib/geo/tech-collector.ts` 하단에 추가:
```typescript
// ── PageSpeed Insights v5 응답 타입 ───────────────────────────────────────

export interface PageSpeedResponse {
  lighthouseResult: {
    categories: { performance: { score: number } }
    audits: {
      'largest-contentful-paint': { numericValue: number }
      'cumulative-layout-shift':  { numericValue: number }
      'is-on-https':              { score: number }
    }
  }
}

// ── PageSpeed 파싱 ───────────────────────────────────────────────────────────

export function parsePageSpeedResult(data: PageSpeedResponse): {
  mobile_score: number
  lcp_ms:       number
  cls:          number
  https:        boolean
} {
  const lr = data.lighthouseResult
  return {
    mobile_score: Math.round((lr.categories.performance.score ?? 0) * 100),
    lcp_ms:       Math.round(lr.audits['largest-contentful-paint'].numericValue ?? 0),
    cls:          parseFloat((lr.audits['cumulative-layout-shift'].numericValue ?? 0).toFixed(3)),
    https:        lr.audits['is-on-https'].score === 1,
  }
}

// ── E-E-A-T 점수 계산 ────────────────────────────────────────────────────────
// 외부 API가 없어 수집된 기술 지표로 프록시 점수 계산
// mobile(30) + https(20) + sitemap(10) + schemas(각 7점, max 35) + faq(5) = max 100

export function computeEeeatScore(metrics: {
  mobile_score: number
  https:        boolean
  sitemap:      boolean
  schema_types: string[]
  faq_schema:   boolean
}): number {
  const score =
    Math.round(metrics.mobile_score * 0.30) +
    (metrics.https   ? 20 : 0) +
    (metrics.sitemap ? 10 : 0) +
    Math.min(metrics.schema_types.length * 7, 35) +
    (metrics.faq_schema ? 5 : 0)
  return Math.min(score, 100)
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected:
```
Test Files  1 passed (1)
Tests  19 passed (19)
```

- [ ] **Step 5: 커밋**

```bash
git add src/lib/geo/tech-collector.ts src/__tests__/lib/geo/tech-collector.test.ts
git commit -m "feat(geo): PageSpeed parser + E-E-A-T score TDD"
```

---

## Task 4: 통합 수집 함수 TDD (collectTechForBrand)

**Files:**
- Modify: `src/__tests__/lib/geo/tech-collector.test.ts` (섹션 추가)
- Modify: `src/lib/geo/tech-collector.ts` (collectTechForBrand + 의존 함수 추가)

- [ ] **Step 1: 테스트에 collectTechForBrand 섹션 추가**

`src/__tests__/lib/geo/tech-collector.test.ts` 하단에 추가:
```typescript
import { collectTechForBrand } from '@/lib/geo/tech-collector'
import { vi } from 'vitest'

// ── collectTechForBrand 통합 테스트 (fetch 모킹) ──────────────────────────

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">{"@type":"Organization","name":"Test Brand"}</script>
  <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>
</head>
<body>Hello</body>
</html>
`

const MOCK_PSI_RESPONSE = {
  lighthouseResult: {
    categories: { performance: { score: 0.85 } },
    audits: {
      'largest-contentful-paint': { numericValue: 1900 },
      'cumulative-layout-shift':  { numericValue: 0.05 },
      'is-on-https':              { score: 1 },
    },
  },
}

describe('collectTechForBrand', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('정상 응답 시 TechSnapshot 반환', async () => {
    // HTML fetch 모킹
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('pagespeedonline')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_PSI_RESPONSE),
        })
      }
      if (url.includes('sitemap.xml')) {
        return Promise.resolve({ ok: true })
      }
      // HTML fetch
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(SAMPLE_HTML),
      })
    }))

    const result = await collectTechForBrand('volnewmer', 'https://www.classys.com')

    expect(result.brand_id).toBe('volnewmer')
    expect(result.schema_types).toContain('Organization')
    expect(result.schema_types).toContain('FAQPage')
    expect(result.faq_schema).toBe(true)
    expect(result.mobile_score).toBe(85)
    expect(result.lcp_ms).toBe(1900)
    expect(result.https).toBe(true)
    expect(result.sitemap).toBe(true)
    expect(result.eeeat_score).toBeGreaterThan(0)
    expect(result.collected_at).toBeTruthy()
    expect(result.error).toBeNull()
  })

  it('HTML fetch 실패 시 schema 비어있고 error 기록', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('pagespeedonline')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_PSI_RESPONSE),
        })
      }
      if (url.includes('sitemap.xml')) {
        return Promise.resolve({ ok: false })
      }
      return Promise.reject(new Error('Network error'))
    }))

    const result = await collectTechForBrand('volnewmer', 'https://www.classys.com')
    expect(result.schema_types).toEqual([])
    expect(result.faq_schema).toBe(false)
    expect(result.sitemap).toBe(false)
    expect(result.error).not.toBeNull()
  })

  it('PageSpeed API 실패 시 lcp_ms=0, mobile_score=0으로 폴백', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('pagespeedonline')) {
        return Promise.resolve({ ok: false, text: () => Promise.resolve('API Error') })
      }
      if (url.includes('sitemap.xml')) {
        return Promise.resolve({ ok: true })
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(SAMPLE_HTML),
      })
    }))

    const result = await collectTechForBrand('volnewmer', 'https://www.classys.com')
    expect(result.mobile_score).toBe(0)
    expect(result.lcp_ms).toBe(0)
    expect(result.https).toBe(false)
    // HTML 파싱은 성공
    expect(result.schema_types).toContain('Organization')
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npm test
```

Expected: FAIL with `collectTechForBrand is not exported`

- [ ] **Step 3: `tech-collector.ts`에 수집 함수 추가**

`src/lib/geo/tech-collector.ts` 하단에 추가:
```typescript
// ── TechSnapshot 타입 ─────────────────────────────────────────────────────────

export interface TechSnapshot {
  brand_id:     string
  schema_types: string[]
  faq_schema:   boolean
  eeeat_score:  number
  lcp_ms:       number
  cls:          number
  mobile_score: number
  https:        boolean
  sitemap:      boolean
  collected_at: string
  error:        string | null
}

// ── 내부 헬퍼 ────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'GEO-Analyzer/1.0 (+https://classys.com)' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`HTML fetch ${res.status}: ${url}`)
  return res.text()
}

async function fetchPageSpeed(websiteUrl: string): Promise<PageSpeedResponse> {
  const apiKey = process.env.PAGESPEED_API_KEY ?? ''
  const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(websiteUrl)}&strategy=mobile&key=${apiKey}`
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`PageSpeed API ${res.status}: ${await res.text()}`)
  return res.json() as Promise<PageSpeedResponse>
}

async function checkSitemap(websiteUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(websiteUrl)
    const sitemapUrl = `${parsed.protocol}//${parsed.host}/sitemap.xml`
    const res = await fetch(sitemapUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5_000),
    })
    return res.ok
  } catch {
    return false
  }
}

// ── 메인 수집 함수 ────────────────────────────────────────────────────────────

export async function collectTechForBrand(
  brandId:    string,
  websiteUrl: string,
): Promise<TechSnapshot> {
  const errors: string[] = []

  const [htmlResult, psiResult, sitemapResult] = await Promise.allSettled([
    fetchHtml(websiteUrl),
    fetchPageSpeed(websiteUrl),
    checkSitemap(websiteUrl),
  ])

  const html = htmlResult.status === 'fulfilled' ? htmlResult.value : ''
  if (htmlResult.status === 'rejected') {
    errors.push(`HTML: ${htmlResult.reason instanceof Error ? htmlResult.reason.message : String(htmlResult.reason)}`)
  }

  const psi  = psiResult.status  === 'fulfilled' ? psiResult.value  : null
  if (psiResult.status === 'rejected') {
    errors.push(`PSI: ${psiResult.reason instanceof Error ? psiResult.reason.message : String(psiResult.reason)}`)
  }

  const sitemap = sitemapResult.status === 'fulfilled' ? sitemapResult.value : false

  const schema_types = parseSchemaTypes(html)
  const faq_schema   = parseFaqSchema(html)
  const { lcp_ms, cls, mobile_score, https: isHttps } = psi
    ? parsePageSpeedResult(psi)
    : { lcp_ms: 0, cls: 0, mobile_score: 0, https: false }

  const eeeat_score = computeEeeatScore({ mobile_score, https: isHttps, sitemap, schema_types, faq_schema })

  return {
    brand_id:     brandId,
    schema_types,
    faq_schema,
    eeeat_score,
    lcp_ms,
    cls,
    mobile_score,
    https:        isHttps,
    sitemap,
    collected_at: new Date().toISOString(),
    error:        errors.length > 0 ? errors.join(' | ') : null,
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected:
```
Test Files  1 passed (1)
Tests  25 passed (25)
```

- [ ] **Step 5: 커밋**

```bash
git add src/lib/geo/tech-collector.ts src/__tests__/lib/geo/tech-collector.test.ts
git commit -m "feat(geo): collectTechForBrand integration function TDD"
```

---

## Task 5: geo-data.ts — website_url 추가

**Files:**
- Modify: `src/app/geo/_data/geo-data.ts`

아래 표의 URL은 직접 확인 후 사용해야 합니다. `VERIFY:` 표시된 URL은 반드시 실제 접속 확인 후 교체하세요.

| brand_id | website_url |
|---|---|
| volnewmer | https://www.classys.com |
| thermage | https://www.thermage.com |
| densiti | https://www.lutronic.com (VERIFY: 덴서티 제조사 Lutronic 공식 사이트) |
| oligio | https://oligio.com (VERIFY: 원텍 올리지오 공식 사이트) |
| tenthermo | VERIFY: 텐써마 제조사 공식 URL 확인 필요 |
| xerf | VERIFY: XERF 제조사 공식 URL 확인 필요 |
| ulthera | https://www.ultherapy.com |
| shrink | https://www.hironic.co.kr |

- [ ] **Step 1: `BrandGeoData` 인터페이스에 website_url 추가**

`src/app/geo/_data/geo-data.ts`의 `BrandGeoData` 인터페이스:
```typescript
export interface BrandGeoData {
  id:           string
  name:         string
  name_en:      string
  company:      string
  color:        string
  device_type:  string
  geo_score:    number
  website_url:  string          // ← 추가
  youtube_query: string
  tech:          TechAeo
  authority:     Authority
  aeo:           AeoBenchmark
  community:     Community
  earned_media:  EarnedMedia
}
```

- [ ] **Step 2: 각 브랜드 객체에 website_url 추가**

`GEO_DATA` 배열의 각 브랜드 객체에 `website_url` 필드 추가. 각 브랜드의 `id:` 바로 다음 줄에 삽입:

```typescript
// volnewmer
id: 'volnewmer',
website_url: 'https://www.classys.com',

// thermage
id: 'thermage',
website_url: 'https://www.thermage.com',

// densiti
id: 'densiti',
website_url: 'https://www.lutronic.com',  // VERIFY 필요

// oligio
id: 'oligio',
website_url: 'https://oligio.com',  // VERIFY 필요

// tenthermo
id: 'tenthermo',
website_url: '',  // TODO: 텐써마 공식 URL 확인 후 추가

// xerf
id: 'xerf',
website_url: '',  // TODO: XERF 공식 URL 확인 후 추가

// ulthera
id: 'ulthera',
website_url: 'https://www.ultherapy.com',

// shrink
id: 'shrink',
website_url: 'https://www.hironic.co.kr',
```

- [ ] **Step 3: TypeScript 타입 오류 없는지 확인**

```bash
npx tsc --noEmit --skipLibCheck
```

Expected: 오류 없음 (또는 기존 오류만 있음)

- [ ] **Step 4: 커밋**

```bash
git add src/app/geo/_data/geo-data.ts
git commit -m "feat(geo): BrandGeoData에 website_url 추가"
```

---

## Task 6: Supabase geo_tech_snapshots 마이그레이션

**Files:**
- (Supabase 대시보드 SQL Editor에서 직접 실행)

- [ ] **Step 1: Supabase 대시보드 → SQL Editor에서 아래 SQL 실행**

```sql
-- geo_tech_snapshots: Tech·AEO 지표 수집 결과 저장
CREATE TABLE IF NOT EXISTS geo_tech_snapshots (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id     text        NOT NULL,
  schema_types text[]      NOT NULL DEFAULT '{}',
  faq_schema   boolean     NOT NULL DEFAULT false,
  eeeat_score  int         NOT NULL DEFAULT 0,
  lcp_ms       int         NOT NULL DEFAULT 0,
  cls          numeric(5,3) NOT NULL DEFAULT 0,
  mobile_score int         NOT NULL DEFAULT 0,
  https        boolean     NOT NULL DEFAULT false,
  sitemap      boolean     NOT NULL DEFAULT false,
  collected_at timestamptz NOT NULL DEFAULT now(),
  error        text
);

-- brand_id + 최신순 조회 인덱스
CREATE INDEX IF NOT EXISTS geo_tech_snapshots_brand_collected
  ON geo_tech_snapshots(brand_id, collected_at DESC);

-- RLS 활성화 (인증된 사용자만 읽기)
ALTER TABLE geo_tech_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users can read geo_tech_snapshots"
  ON geo_tech_snapshots FOR SELECT
  TO authenticated
  USING (true);
```

- [ ] **Step 2: 마이그레이션 확인**

Supabase 대시보드 → Table Editor에서 `geo_tech_snapshots` 테이블이 생성됐는지 확인.

- [ ] **Step 3: 커밋 (SQL 문서화)**

`docs/supabase/migrations/` 폴더에 마이그레이션 문서 저장:
```bash
mkdir -p docs/supabase/migrations
```

`docs/supabase/migrations/2026-05-15-geo-tech-snapshots.sql` 파일 생성 (위 SQL 내용 그대로 저장):

```bash
git add docs/supabase/migrations/2026-05-15-geo-tech-snapshots.sql
git commit -m "docs: Supabase geo_tech_snapshots 마이그레이션 SQL 추가"
```

---

## Task 7: /api/geo/tech-snapshot GET 라우트

**Files:**
- Create: `src/app/api/geo/tech-snapshot/route.ts`

- [ ] **Step 1: 라우트 파일 생성**

`src/app/api/geo/tech-snapshot/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

// GET /api/geo/tech-snapshot?brandId=volnewmer
// 해당 브랜드의 최신 tech 스냅샷 반환. 없으면 geo-data.ts 정적 데이터 폴백.
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const brandId = new URL(req.url).searchParams.get('brandId')
  if (!brandId) return NextResponse.json({ error: 'brandId 필수' }, { status: 400 })

  const { data, error } = await supabase
    .from('geo_tech_snapshots')
    .select('*')
    .eq('brand_id', brandId)
    .order('collected_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    // Supabase에 데이터 없음 → 정적 데이터 폴백
    const brand = GEO_DATA.find(b => b.id === brandId)
    if (!brand) return NextResponse.json({ error: '브랜드 없음' }, { status: 404 })
    return NextResponse.json({ snapshot: brand.tech, source: 'static' })
  }

  return NextResponse.json({ snapshot: data, source: 'live' })
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
npx tsc --noEmit --skipLibCheck
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/geo/tech-snapshot/route.ts
git commit -m "feat(geo): tech-snapshot GET 라우트 (Supabase + 정적 폴백)"
```

---

## Task 8: /api/geo/collect POST 라우트 (수동 수집)

**Files:**
- Create: `src/app/api/geo/collect/route.ts`

이 라우트는 인증된 사용자가 UI 버튼에서 호출하는 수동 수집 엔드포인트입니다.

- [ ] **Step 1: 환경변수 확인**

`.env.local`에 아래 키가 있는지 확인 (없으면 추가):
```
PAGESPEED_API_KEY=your_google_cloud_api_key_here
```

Google PageSpeed Insights API 키 발급: Google Cloud Console → API & Services → Enable "PageSpeed Insights API" → Create credentials → API key

- [ ] **Step 2: 라우트 파일 생성**

`src/app/api/geo/collect/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { collectTechForBrand, type TechSnapshot } from '@/lib/geo/tech-collector'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

// POST /api/geo/collect
// Body: { brandId?: string }  — 생략 시 전체 브랜드 수집
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { brandId?: string } = {}
  try { body = await req.json() } catch { /* empty body OK */ }

  const targets = body.brandId
    ? GEO_DATA.filter(b => b.id === body.brandId && b.website_url)
    : GEO_DATA.filter(b => b.website_url)

  if (targets.length === 0) {
    return NextResponse.json({ error: '수집 대상 브랜드 없음 (website_url 확인)' }, { status: 400 })
  }

  const admin = createAdminClient()
  const results: Array<{ brand: string; ok: boolean; error?: string }> = []

  for (const brand of targets) {
    try {
      const snapshot: TechSnapshot = await collectTechForBrand(brand.id, brand.website_url)
      const { error: dbError } = await admin
        .from('geo_tech_snapshots')
        .insert(snapshot)
      if (dbError) throw new Error(dbError.message)
      results.push({ brand: brand.name, ok: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[geo/collect] ${brand.name} 실패:`, msg)
      results.push({ brand: brand.name, ok: false, error: msg })
    }
  }

  return NextResponse.json({ ok: true, results, collected_at: new Date().toISOString() })
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
npx tsc --noEmit --skipLibCheck
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/geo/collect/route.ts
git commit -m "feat(geo): /api/geo/collect 수동 수집 POST 라우트"
```

---

## Task 9: /api/cron/geo-tech Cron 라우트 + vercel.json 업데이트

**Files:**
- Create: `src/app/api/cron/geo-tech/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: cron 라우트 생성**

`src/app/api/cron/geo-tech/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { collectTechForBrand, type TechSnapshot } from '@/lib/geo/tech-collector'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// Vercel Cron: GET /api/cron/geo-tech — 매일 02:30 KST (17:30 UTC)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const targets = GEO_DATA.filter(b => b.website_url)
  const admin   = createAdminClient()
  const results: Array<{ brand: string; ok: boolean; error?: string }> = []

  for (const brand of targets) {
    try {
      const snapshot: TechSnapshot = await collectTechForBrand(brand.id, brand.website_url)
      const { error: dbError } = await admin
        .from('geo_tech_snapshots')
        .insert(snapshot)
      if (dbError) throw new Error(dbError.message)
      results.push({ brand: brand.name, ok: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[cron/geo-tech] ${brand.name} 실패:`, msg)
      results.push({ brand: brand.name, ok: false, error: msg })
    }
  }

  const successCount = results.filter(r => r.ok).length
  return NextResponse.json({
    ok:           true,
    success:      successCount,
    total:        targets.length,
    results,
    collected_at: new Date().toISOString(),
  })
}
```

- [ ] **Step 2: vercel.json에 cron 추가**

`vercel.json`의 `crons` 배열에 추가:
```json
{
  "crons": [
    {
      "path": "/api/market/refresh",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/geo-scores",
      "schedule": "0 17 * * *"
    },
    {
      "path": "/api/cron/geo-tech",
      "schedule": "30 17 * * *"
    },
    {
      "path": "/api/cron/geo-community",
      "schedule": "0 18 * * *"
    },
    {
      "path": "/api/cron/geo-alerts",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
npx tsc --noEmit --skipLibCheck
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/cron/geo-tech/route.ts vercel.json
git commit -m "feat(geo): geo-tech Cron 라우트 + vercel.json 스케줄 추가"
```

---

## Task 10: GeoClient — TechAeoTab Supabase 연동 + 수집 버튼 UI

**Files:**
- Modify: `src/app/geo/_components/GeoClient.tsx`

이 Task는 두 가지 변경이 포함됩니다:
1. 선택된 브랜드가 바뀔 때 `/api/geo/tech-snapshot`에서 최신 데이터 로드 (없으면 정적 폴백)
2. "데이터 수집하기" 버튼 → `/api/geo/collect` POST 호출 → 성공 후 데이터 재로드

현재 코드 기준 (line 1585~1710):
- `GeoClient` 컴포넌트의 `selectedBrandIdx` state (line 1587)
- `brand = GEO_DATA[selectedBrandIdx]` (line 1591)
- `<TechAeoTab tech={brand.tech} />` (line 1705)

- [ ] **Step 1: GeoClient에 state와 fetch 로직 추가**

`GeoClient` 컴포넌트 내 `const brand = GEO_DATA[selectedBrandIdx]` 아래에 추가:
```typescript
const brand = GEO_DATA[selectedBrandIdx]

// ── Tech 스냅샷 Supabase 연동 ──────────────────────────────────────────────
const [techSnapshot, setTechSnapshot] = useState<typeof brand.tech | null>(null)
const [techLoading,  setTechLoading]  = useState(false)
const [collectState, setCollectState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

async function loadTechSnapshot(brandId: string) {
  setTechLoading(true)
  try {
    const res = await fetch(`/api/geo/tech-snapshot?brandId=${brandId}`)
    if (res.ok) {
      const json = await res.json() as { snapshot: typeof brand.tech }
      setTechSnapshot(json.snapshot)
    } else {
      setTechSnapshot(null)
    }
  } catch {
    setTechSnapshot(null)
  } finally {
    setTechLoading(false)
  }
}

async function handleCollect() {
  setCollectState('loading')
  try {
    const res = await fetch('/api/geo/collect', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ brandId: brand.id }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    setCollectState('done')
    await loadTechSnapshot(brand.id)
    setTimeout(() => setCollectState('idle'), 3000)
  } catch {
    setCollectState('error')
    setTimeout(() => setCollectState('idle'), 3000)
  }
}

useEffect(() => {
  setTechSnapshot(null)
  loadTechSnapshot(brand.id)
}, [brand.id])
```

- [ ] **Step 2: TechAeoTab에 실제 데이터 / 폴백 데이터 전달**

line 1705의 `<TechAeoTab tech={brand.tech} />`를 교체:
```typescript
{activeTab === 0 && (
  <TechAeoTab
    tech={techSnapshot ?? brand.tech}
    isLive={techSnapshot !== null}
    isLoading={techLoading}
    onCollect={handleCollect}
    collectState={collectState}
    brandName={brand.name}
  />
)}
```

- [ ] **Step 3: TechAeoTab props 타입 및 UI 업데이트**

`src/app/geo/_components/GeoClient.tsx` 의 `TechAeoTab` 함수 시그니처 (line 583) 변경:
```typescript
function TechAeoTab({
  tech,
  isLive,
  isLoading,
  onCollect,
  collectState,
  brandName,
}: {
  tech:         TechAeo
  isLive:       boolean
  isLoading:    boolean
  onCollect:    () => void
  collectState: 'idle' | 'loading' | 'done' | 'error'
  brandName:    string
}) {
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null)
  const vitals = [
    { label: 'LCP',          value: `${(tech.lcp_ms / 1000).toFixed(1)}s`, good: tech.lcp_ms <= 2500,     hint: '권장 ≤ 2.5s' },
    { label: 'CLS',          value: tech.cls.toFixed(2),                    good: tech.cls <= 0.1,          hint: '권장 ≤ 0.1' },
    { label: 'Mobile Score', value: `${tech.mobile_score}`,                 good: tech.mobile_score >= 80,  hint: '권장 ≥ 80' },
  ]
  const allSchemas = ['MedicalProcedure', 'Product', 'FAQPage', 'Organization', 'BreadcrumbList', 'WebPage']
```

- [ ] **Step 4: TechAeoTab 헤더에 데이터 출처 배지 + 수집 버튼 추가**

`TechAeoTab` return 블록 최상단(`<div className="space-y-6">` 바로 아래)에 추가:
```tsx
return (
  <div className="space-y-6">
    {/* 데이터 출처 + 수집 버튼 */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <span className="text-xs text-slate-400 animate-pulse">데이터 로딩 중...</span>
        ) : (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isLive ? '실시간 데이터' : '정적 데이터'}
          </span>
        )}
        {isLive && tech.checked_at && (
          <span className="text-xs text-slate-400">수집: {new Date(tech.checked_at).toLocaleDateString('ko-KR')}</span>
        )}
      </div>
      <button
        onClick={onCollect}
        disabled={collectState === 'loading' || isLoading}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
          ${collectState === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-not-allowed animate-pulse'
          : collectState === 'done'    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
          : collectState === 'error'   ? 'bg-red-50 border-red-200 text-red-600'
          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'}`}
      >
        {collectState === 'loading' ? '수집 중...'
         : collectState === 'done'  ? '수집 완료!'
         : collectState === 'error' ? '수집 실패'
         : `${brandName} 데이터 수집`}
      </button>
    </div>

    {/* Schema */}
    ...이하 기존 코드 유지
```

- [ ] **Step 5: TypeScript 오류 확인**

```bash
npx tsc --noEmit --skipLibCheck
```

Expected: 오류 없음

- [ ] **Step 6: 전체 테스트 통과 확인**

```bash
npm test
```

Expected: 모든 25개 테스트 통과

- [ ] **Step 7: 커밋 및 push**

```bash
git add src/app/geo/_components/GeoClient.tsx
git commit -m "feat(geo): TechAeoTab Supabase 연동 + 데이터 수집하기 버튼"
git push origin main
```

---

## 환경변수 체크리스트

배포 전 Vercel 대시보드 및 `.env.local`에서 아래 변수 확인:

| 변수명 | 용도 | 발급처 |
|---|---|---|
| `PAGESPEED_API_KEY` | Google PageSpeed Insights API | Google Cloud Console |
| `CRON_SECRET` | Cron 라우트 인증 | 임의 문자열, Vercel 환경변수에 동일하게 설정 |
| `ANTHROPIC_API_KEY` | 기존 Claude 호출 | 기존 설정 유지 |
| `OPENAI_API_KEY` | 기존 GPT 호출 | 기존 설정 유지 |
| `GEMINI_API_KEY` | 기존 Gemini 호출 | 기존 설정 유지 |

---

## Self-Review

**1. Spec 커버리지 점검:**
- ✅ 실시간 API 연동 (PageSpeed + Schema 크롤러)
- ✅ Cron 자동 갱신 (`/api/cron/geo-tech`, vercel.json)
- ✅ 수동 갱신 버튼 (`/api/geo/collect` + GeoClient 버튼)
- ✅ TDD (Vitest 단위 테스트 25개, 모든 순수 함수 커버)
- ✅ Supabase 스토리지
- ✅ 정적 데이터 폴백 (website_url 없는 브랜드 포함)

**2. 플레이스홀더 없음 확인:**
- ✅ 모든 코드 블록 완전히 작성됨
- ⚠️ tenthermo, xerf의 website_url은 확인 필요 (빈 문자열로 처리, 수집 대상 제외)

**3. 타입 일관성:**
- `TechSnapshot` (tech-collector.ts) → `geo_tech_snapshots` 테이블 컬럼 → API 응답 → GeoClient props 모두 일치
- `tech.checked_at`: TechAeo 기존 타입은 `string`, TechSnapshot의 `collected_at`도 `string` (ISO 8601) — TechAeoTab에서 표시 시 `tech.checked_at`을 사용하므로 두 타입의 동명 필드가 다름에 주의. TechSnapshot이 반환되면 `collected_at`이 `checked_at` 역할을 한다. GeoClient에서 `techSnapshot`을 `TechAeo` 타입으로 캐스팅하려면 `collected_at → checked_at` 매핑이 필요.

**⚠️ 타입 불일치 수정 필요:**
Task 10 Step 1의 `loadTechSnapshot`에서 API 응답(`TechSnapshot`)을 `TechAeo` 타입으로 변환할 때 필드명 매핑이 필요합니다:

```typescript
// loadTechSnapshot 내 json 파싱 부분 수정:
const raw = json.snapshot
// TechSnapshot → TechAeo 변환 (collected_at → checked_at)
const techAeo: typeof brand.tech = {
  schema_types: raw.schema_types ?? [],
  faq_schema:   raw.faq_schema   ?? false,
  eeeat_score:  raw.eeeat_score  ?? 0,
  lcp_ms:       raw.lcp_ms       ?? 0,
  cls:          raw.cls          ?? 0,
  mobile_score: raw.mobile_score ?? 0,
  https:        raw.https        ?? false,
  sitemap:      raw.sitemap      ?? false,
  checked_at:   raw.collected_at ?? new Date().toISOString().split('T')[0],
}
setTechSnapshot(techAeo)
```

이 수정을 Task 10 Step 1의 `loadTechSnapshot` 함수에 반영하세요.
