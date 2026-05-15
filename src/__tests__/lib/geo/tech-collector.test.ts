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
