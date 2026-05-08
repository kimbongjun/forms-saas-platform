'use client'
import { useEffect, useRef, useState } from 'react'

type Competition = 'high' | 'mid' | 'low'

interface CloudWord {
  text: string
  value: number
  competition: Competition
}

interface PlacedWord extends CloudWord {
  x: number
  y: number
  size: number
}

const COMP_COLORS: Record<Competition, string> = {
  high: '#dc2626',
  mid: '#d97706',
  low: '#16a34a',
}

// Korean char ~0.9em, Latin ~0.55em
function estimateTextWidth(text: string, fontSize: number): number {
  let w = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    // Korean Unicode range: AC00–D7A3 (가-힣), 1100–11FF, 3130–318F
    const isKorean = (code >= 0xAC00 && code <= 0xD7A3) || (code >= 0x1100 && code <= 0x11FF) || (code >= 0x3130 && code <= 0x318F)
    w += fontSize * (isKorean ? 0.95 : 0.58)
  }
  return w
}

function buildLayout(
  words: CloudWord[],
  canvasW: number,
  canvasH: number,
): PlacedWord[] {
  const maxVal = Math.max(...words.map(w => w.value), 1)
  const minFont = 13, maxFont = 50
  const padX = 6, padY = 4

  const sorted = [...words].sort((a, b) => b.value - a.value)
  const placed: (PlacedWord & { hw: number; hh: number })[] = []

  const cx = canvasW / 2, cy = canvasH / 2

  for (const word of sorted) {
    const size = Math.round(minFont + Math.sqrt(word.value / maxVal) * (maxFont - minFont))
    const tw = estimateTextWidth(word.text, size)
    const th = size * 1.3
    const hw = tw / 2 + padX, hh = th / 2 + padY

    // Archimedean spiral outward from center
    let found = false
    const spiralA = 2.5
    for (let t = 0; t < 1000; t += 0.25) {
      const r = spiralA * t
      const angle = t * 1.2
      // Flatten spiral vertically (word clouds are typically wider than tall)
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle) * 0.55

      // Bounds check (keep inside canvas)
      if (Math.abs(x) + hw > cx || Math.abs(y) + hh > cy) continue

      // Collision with already-placed words
      let collision = false
      for (const p of placed) {
        if (Math.abs(x - p.x) < hw + p.hw && Math.abs(y - p.y) < hh + p.hh) {
          collision = true
          break
        }
      }

      if (!collision) {
        placed.push({ ...word, x, y, size, hw, hh })
        found = true
        break
      }
    }
    if (!found) {
      // Fallback: place at a random edge position — better than dropping the word
      placed.push({ ...word, x: 0, y: (placed.length - 3) * (maxFont + 8), size, hw, hh })
    }
  }

  return placed.map(({ hw: _hw, hh: _hh, ...w }) => w)
}

export default function WordCloudView({
  words,
  onWordClick,
}: {
  words: CloudWord[]
  onWordClick: (text: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [placed, setPlaced] = useState<PlacedWord[]>([])
  const [containerW, setContainerW] = useState(0)
  const H = 260

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.getBoundingClientRect().width
      if (w > 0) setContainerW(w)
    }
    const obs = new ResizeObserver(update)
    obs.observe(el)
    update()
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!words.length || containerW === 0) return
    setPlaced(buildLayout(words, containerW, H))
  }, [words, containerW])

  const W = containerW || 600

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: H }}>
      {placed.length === 0 ? (
        <div className="flex items-center justify-center text-xs text-gray-300 animate-pulse" style={{ height: H }}>
          레이아웃 계산 중...
        </div>
      ) : (
        <svg width={W} height={H} className="w-full overflow-visible select-none">
          <g transform={`translate(${W / 2},${H / 2})`}>
            {placed.map(w => (
              <text
                key={w.text}
                textAnchor="middle"
                dominantBaseline="middle"
                x={w.x}
                y={w.y}
                fontSize={w.size}
                fontWeight="700"
                fontFamily='-apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif'
                fill={COMP_COLORS[w.competition]}
                style={{ cursor: 'pointer' }}
                className="transition-opacity duration-150 hover:opacity-60"
                onClick={() => onWordClick(w.text)}
              >
                {w.text}
              </text>
            ))}
          </g>
        </svg>
      )}
    </div>
  )
}
