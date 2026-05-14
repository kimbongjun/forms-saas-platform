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
