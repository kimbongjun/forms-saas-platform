'use client'

import { useState } from 'react'
import { MapPin, Info } from 'lucide-react'

interface MapFieldEditorProps {
  content: string
  onChange: (src: string) => void
}

/**
 * 입력값을 embed src URL로 변환
 * 1. <iframe src="..."> → src 추출
 * 2. 일반 Google Maps URL → embed 포맷으로 변환 (z=16)
 * 3. embed URL / 주소 텍스트 → 그대로 embed URL 생성
 */
function toEmbedSrc(input: string): string {
  const raw = input.trim()
  if (!raw) return ''

  // <iframe ... src="URL" ...> → src 추출
  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/)
  if (iframeSrcMatch) return iframeSrcMatch[1]

  // 이미 embed URL
  if (raw.includes('output=embed') || raw.includes('/maps/embed')) return raw

  // 일반 Google Maps URL (google.com/maps/place/... 등)
  if (raw.startsWith('https://')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=16&output=embed`
  }

  // 주소/장소명 텍스트
  return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=16&output=embed`
}

export default function MapFieldEditor({ content, onChange }: MapFieldEditorProps) {
  const [input, setInput] = useState('')

  function handleChange(value: string) {
    setInput(value)
    const src = toEmbedSrc(value)
    onChange(src)
  }

  return (
    <div className="space-y-3">

      {/* 안내 */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          <strong>Google 지도</strong> → 원하는 위치 검색 → 공유 → <strong>지도 퍼가기</strong> →
          iframe 코드 복사 후 붙여넣기
        </span>
      </div>

      {/* 입력 */}
      <textarea
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>\n또는 주소 직접 입력: 서울특별시 중구 세종대로 110`}
        rows={3}
        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      {/* 현재 저장된 URL (편집 모드) */}
      {!input && content && (
        <p className="flex items-center gap-1 text-xs text-emerald-600">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          지도 설정됨 — 새 코드를 붙여넣으면 교체됩니다
        </p>
      )}

      {/* 미리보기 */}
      {(toEmbedSrc(input) || content) && (
        <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: '40%' }}>
          <iframe
            src={toEmbedSrc(input) || content}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

    </div>
  )
}
