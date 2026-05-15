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
