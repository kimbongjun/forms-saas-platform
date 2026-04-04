export function formatNumberWithCommas(value: number | string | null | undefined) {
  if (value == null || value === '') return '0'
  const numeric = Number(String(value).replace(/,/g, ''))
  if (Number.isNaN(numeric)) return '0'
  return numeric.toLocaleString('ko-KR')
}

export function parseNumberInput(raw: string) {
  const digitsOnly = raw.replace(/[^\d]/g, '')
  if (!digitsOnly) return 0
  return Number(digitsOnly)
}

export function parseNullableNumberInput(raw: string) {
  const digitsOnly = raw.replace(/[^\d]/g, '')
  if (!digitsOnly) return null
  return Number(digitsOnly)
}
