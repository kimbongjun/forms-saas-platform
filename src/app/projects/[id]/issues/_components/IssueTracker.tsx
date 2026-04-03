'use client'

import { useState } from 'react'
import { Plus, Bug, Lightbulb, HelpCircle, Pencil, Trash2, Check, X, ChevronDown } from 'lucide-react'

type IssueType = 'bug' | 'suggestion' | 'question'
type IssueUrgency = 'critical' | 'high' | 'normal' | 'low'
type IssueStatus = 'open' | 'in_progress' | 'resolved'

interface Issue {
  id: string
  project_id: string
  title: string
  description: string
  type: IssueType
  urgency: IssueUrgency
  status: IssueStatus
  created_at: string
  updated_at: string
}

interface IssueTrackerProps {
  projectId: string
  initialIssues: Issue[]
}

const TYPE_META: Record<IssueType, { label: string; Icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  bug: { label: '결함(Bug)', Icon: Bug, color: 'text-red-600', bg: 'bg-red-50' },
  suggestion: { label: '건의사항', Icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
  question: { label: '질문', Icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
}

const URGENCY_META: Record<IssueUrgency, { label: string; color: string }> = {
  critical: { label: '긴급', color: 'bg-red-100 text-red-700' },
  high: { label: '높음', color: 'bg-orange-100 text-orange-700' },
  normal: { label: '보통', color: 'bg-gray-100 text-gray-600' },
  low: { label: '낮음', color: 'bg-gray-50 text-gray-400' },
}

const STATUS_META: Record<IssueStatus, { label: string; color: string }> = {
  open: { label: '열림', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: '진행 중', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: '해결됨', color: 'bg-emerald-100 text-emerald-700' },
}

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'bug' as IssueType,
  urgency: 'normal' as IssueUrgency,
  status: 'open' as IssueStatus,
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default function IssueTracker({ projectId, initialIssues }: IssueTrackerProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState<IssueType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = issues.filter((i) => {
    if (filterType !== 'all' && i.type !== filterType) return false
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    return true
  })

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/projects/${projectId}/issues`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issueId: editingId, ...form }),
        })
        const data = await res.json()
        setIssues((prev) => prev.map((i) => (i.id === editingId ? data : i)))
      } else {
        const res = await fetch(`/api/projects/${projectId}/issues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        setIssues((prev) => [data, ...prev])
      }
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 이슈를 삭제할까요?')) return
    await fetch(`/api/projects/${projectId}/issues`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: id }),
    })
    setIssues((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleStatusChange(issue: Issue, status: IssueStatus) {
    const res = await fetch(`/api/projects/${projectId}/issues`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: issue.id, status }),
    })
    const data = await res.json()
    setIssues((prev) => prev.map((i) => (i.id === issue.id ? data : i)))
  }

  function startEdit(issue: Issue) {
    setEditingId(issue.id)
    setForm({
      title: issue.title,
      description: issue.description,
      type: issue.type,
      urgency: issue.urgency,
      status: issue.status,
    })
    setShowForm(true)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const counts = {
    all: issues.length,
    bug: issues.filter((i) => i.type === 'bug').length,
    suggestion: issues.filter((i) => i.type === 'suggestion').length,
    question: issues.filter((i) => i.type === 'question').length,
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">이슈 트래커</h2>
          <p className="mt-0.5 text-sm text-gray-500">결함, 건의사항, 질문을 유형별로 관리합니다.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          이슈 등록
        </button>
      </div>

      {/* 이슈 등록/편집 폼 */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-900">
            {editingId ? '이슈 편집' : '새 이슈 등록'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-gray-600">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="이슈 제목"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as IssueType }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                <option value="bug">결함 (Bug)</option>
                <option value="suggestion">건의사항</option>
                <option value="question">질문</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">긴급도</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as IssueUrgency }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                <option value="critical">긴급</option>
                <option value="high">높음</option>
                <option value="normal">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-gray-600">상세 내용</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="이슈 상세 내용 (선택)"
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              취소
            </button>
          </div>
        </div>
      )}

      {/* 필터 탭 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 유형 필터 */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(['all', 'bug', 'suggestion', 'question'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                filterType === t ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {t === 'all' ? (
                <>전체 <span className="opacity-60">({counts.all})</span></>
              ) : (
                <>
                  {t === 'bug' && <Bug className="h-3 w-3" />}
                  {t === 'suggestion' && <Lightbulb className="h-3 w-3" />}
                  {t === 'question' && <HelpCircle className="h-3 w-3" />}
                  {TYPE_META[t].label}
                  <span className="opacity-60">({counts[t]})</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                filterStatus === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {s === 'all' ? '전체' : STATUS_META[s as IssueStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* 이슈 목록 */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-gray-400">등록된 이슈가 없습니다.</p>
          <p className="mt-1 text-xs text-gray-300">&apos;이슈 등록&apos; 버튼을 눌러 이슈를 추가하세요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((issue) => {
            const typeMeta = TYPE_META[issue.type]
            const urgencyMeta = URGENCY_META[issue.urgency]
            const statusMeta = STATUS_META[issue.status]
            const expanded = expandedId === issue.id

            return (
              <div
                key={issue.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div
                  className="flex cursor-pointer items-start gap-3 p-4 hover:bg-gray-50"
                  onClick={() => setExpandedId(expanded ? null : issue.id)}
                >
                  {/* 유형 아이콘 */}
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeMeta.bg}`}>
                    <typeMeta.Icon className={`h-3.5 w-3.5 ${typeMeta.color}`} />
                  </div>

                  {/* 내용 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${urgencyMeta.color}`}>
                        {urgencyMeta.label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {typeMeta.label} · {formatDate(issue.created_at)}
                    </p>
                  </div>

                  {/* 액션 */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(issue) }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(issue.id) }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <ChevronDown className={['h-4 w-4 text-gray-300 transition-transform', expanded ? 'rotate-180' : ''].join(' ')} />
                  </div>
                </div>

                {/* 펼침: 상세 내용 + 상태 변경 */}
                {expanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    {issue.description && (
                      <p className="mb-3 whitespace-pre-wrap text-sm text-gray-600">{issue.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-gray-400">상태 변경:</span>
                      {(['open', 'in_progress', 'resolved'] as IssueStatus[]).map((s) => (
                        <button
                          key={s}
                          disabled={issue.status === s}
                          onClick={() => handleStatusChange(issue, s)}
                          className={[
                            'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                            issue.status === s
                              ? `${STATUS_META[s].color} cursor-default`
                              : 'border border-gray-200 text-gray-500 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
