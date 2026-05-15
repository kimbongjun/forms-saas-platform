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

import { parsePageSpeedResult, computeEeeatScore } from '@/lib/geo/tech-collector'

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

import { collectTechForBrand } from '@/lib/geo/tech-collector'
import { vi, beforeEach } from 'vitest'

const SAMPLE_HTML = `<!DOCTYPE html><html><head>
  <script type="application/ld+json">{"@type":"Organization","name":"Test"}</script>
  <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>
</head><body>Hello</body></html>`

const MOCK_PSI = {
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
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes('pagespeedonline')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_PSI) })
      }
      if ((url as string).includes('sitemap.xml')) {
        return Promise.resolve({ ok: true })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve(SAMPLE_HTML) })
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
      if ((url as string).includes('pagespeedonline')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_PSI) })
      }
      if ((url as string).includes('sitemap.xml')) {
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
      if ((url as string).includes('pagespeedonline')) {
        return Promise.resolve({ ok: false, text: () => Promise.resolve('API Error') })
      }
      if ((url as string).includes('sitemap.xml')) {
        return Promise.resolve({ ok: true })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve(SAMPLE_HTML) })
    }))

    const result = await collectTechForBrand('volnewmer', 'https://www.classys.com')
    expect(result.mobile_score).toBe(0)
    expect(result.lcp_ms).toBe(0)
    expect(result.https).toBe(false)
    expect(result.schema_types).toContain('Organization')
  })
})
