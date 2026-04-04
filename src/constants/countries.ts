export interface CountryOption {
  code: string
  label: string
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'KR', label: '대한민국' },
  { code: 'US', label: '미국' },
  { code: 'JP', label: '일본' },
  { code: 'CN', label: '중국' },
  { code: 'TW', label: '대만' },
  { code: 'SG', label: '싱가포르' },
  { code: 'VN', label: '베트남' },
  { code: 'TH', label: '태국' },
  { code: 'MY', label: '말레이시아' },
  { code: 'ID', label: '인도네시아' },
  { code: 'PH', label: '필리핀' },
  { code: 'IN', label: '인도' },
  { code: 'AU', label: '호주' },
  { code: 'NZ', label: '뉴질랜드' },
  { code: 'GB', label: '영국' },
  { code: 'FR', label: '프랑스' },
  { code: 'DE', label: '독일' },
  { code: 'IT', label: '이탈리아' },
  { code: 'ES', label: '스페인' },
  { code: 'CA', label: '캐나다' },
  { code: 'BR', label: '브라질' },
  { code: 'MX', label: '멕시코' },
]

const COUNTRY_LABEL_BY_CODE = new Map(COUNTRY_OPTIONS.map((country) => [country.code, country.label]))
const COUNTRY_CODE_BY_LABEL = new Map(COUNTRY_OPTIONS.map((country) => [country.label, country.code]))

function flagFromCode(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return ''
  return String.fromCodePoint(...code.split('').map((char) => 127397 + char.charCodeAt(0)))
}

export function resolveCountryCode(raw?: string | null) {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const upper = trimmed.toUpperCase()
  if (COUNTRY_LABEL_BY_CODE.has(upper)) return upper
  return COUNTRY_CODE_BY_LABEL.get(trimmed) ?? null
}

export function resolveCountryLabel(raw?: string | null) {
  const code = resolveCountryCode(raw)
  if (!code) return raw?.trim() || null
  return COUNTRY_LABEL_BY_CODE.get(code) ?? code
}

export function resolveCountryFlag(raw?: string | null) {
  const code = resolveCountryCode(raw)
  if (!code) return ''
  return flagFromCode(code)
}
