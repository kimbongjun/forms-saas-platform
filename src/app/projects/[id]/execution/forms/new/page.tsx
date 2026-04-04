'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

function randomSlug() {
  return `form-${Math.random().toString(36).slice(2, 8)}`
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900'

export default function NewFormPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const workspaceId = params.id

  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    const trimmed = title.trim()
    if (!trimmed) { setError('폼 이름을 입력해 주세요.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          slug: randomSlug(),
          workspaceProjectId: workspaceId,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '생성 실패')
      router.push(`/projects/${workspaceId}/execution/forms/${json.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <Link
          href={`/projects/${workspaceId}/execution/forms`}
          className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          폼 목록으로
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">New Form</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">새 폼 만들기</h2>
        <p className="mt-2 text-sm text-gray-500">폼 이름을 입력하면 빌더 화면으로 이동합니다.</p>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">폼 이름 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="예) 사전 신청 폼, 만족도 설문"
            className={inputCls}
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? '생성 중...' : '폼 생성 및 편집 시작'}
          </button>
        </div>
      </section>
    </div>
  )
}
