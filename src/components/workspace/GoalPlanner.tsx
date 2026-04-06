'use client'

import { useMemo, useRef, useState } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import type { ProjectGoalItem } from '@/types/database'

interface GoalPlannerProps {
  projectId: string
  initialItems: ProjectGoalItem[]
  warning?: string | null
}

const COLUMNS: Array<{ key: keyof ProjectGoalItem; label: string; width: string }> = [
  { key: 'item', label: '항목', width: 'minmax(180px,1.2fr)' },
  { key: 'metric', label: '지표', width: 'minmax(150px,1fr)' },
  { key: 'evaluation_method', label: '평가방법', width: '120px' },
  { key: 'unit', label: '단위', width: '110px' },
  { key: 'target', label: 'Target', width: '140px' },
  { key: 'actual', label: 'Actual', width: '140px' },
  { key: 'gap', label: 'Gap', width: '140px' },
  { key: 'final_evaluation', label: '최종평가', width: '140px' },
  { key: 'weight_percent', label: '가중치(%)', width: '120px' },
]

function createGoalItem(id: string): ProjectGoalItem {
  return {
    id,
    item: '',
    metric: '',
    evaluation_method: '정량',
    unit: '',
    target: '',
    actual: '',
    gap: '',
    final_evaluation: '',
    weight_percent: 0,
  }
}

function normalizeGoalItem(item: Partial<ProjectGoalItem>, index: number): ProjectGoalItem {
  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id : `goal-item-${index + 1}`,
    item: typeof item.item === 'string' ? item.item : '',
    metric: typeof item.metric === 'string' ? item.metric : '',
    evaluation_method: item.evaluation_method === '정성' ? '정성' : '정량',
    unit: typeof item.unit === 'string' ? item.unit : '',
    target: typeof item.target === 'string' ? item.target : '',
    actual: typeof item.actual === 'string' ? item.actual : '',
    gap: typeof item.gap === 'string' ? item.gap : '',
    final_evaluation: typeof item.final_evaluation === 'string' ? item.final_evaluation : '',
    weight_percent: Math.max(0, Number(item.weight_percent) || 0),
  }
}

function parseNumericLike(value: string) {
  const normalized = value.replace(/,/g, '').trim()
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value)}%`
}

function resolveDerivedGap(item: ProjectGoalItem) {
  if (item.gap.trim()) return item.gap
  const target = parseNumericLike(item.target)
  const actual = parseNumericLike(item.actual)
  if (target == null || actual == null) return ''
  return String(actual - target)
}

function resolveAchievement(item: ProjectGoalItem) {
  const target = parseNumericLike(item.target)
  const actual = parseNumericLike(item.actual)
  if (target == null || actual == null || target === 0) return null
  return (actual / target) * 100
}

function resolveFinalEvaluation(item: ProjectGoalItem) {
  if (item.final_evaluation.trim()) return item.final_evaluation
  const achievement = resolveAchievement(item)
  if (achievement == null) return '평가 대기'
  if (Math.round(achievement) === 100) return '달성'
  if (achievement > 100) return `${Math.round(achievement - 100)}% 초과 달성`
  return `${Math.round(100 - achievement)}% 미달`
}

const inputCls =
  'theme-input w-full rounded-none border-0 bg-transparent px-3 py-2 text-sm focus:ring-0 focus:outline-none'

export default function GoalPlanner({ projectId, initialItems, warning }: GoalPlannerProps) {
  const normalizedInitialItems = useMemo(
    () =>
      initialItems.length > 0
        ? initialItems.map((item, index) => normalizeGoalItem(item, index))
        : [createGoalItem('goal-item-1')],
    [initialItems]
  )
  const idRef = useRef(normalizedInitialItems.length || 1)
  const [items, setItems] = useState<ProjectGoalItem[]>(
    normalizedInitialItems
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const summary = useMemo(() => {
    const filled = items.filter((item) => item.item.trim() || item.metric.trim())
    const achievements = filled
      .map((item) => ({ achievement: resolveAchievement(item), weight: Math.max(0, Number(item.weight_percent) || 0) }))
      .filter((entry): entry is { achievement: number; weight: number } => entry.achievement != null)

    const avgAchievement =
      achievements.length > 0
        ? achievements.reduce((sum, entry) => sum + entry.achievement, 0) / achievements.length
        : 0

    const totalWeight = achievements.reduce((sum, entry) => sum + entry.weight, 0)
    const weightedScore =
      totalWeight > 0
        ? achievements.reduce((sum, entry) => sum + entry.achievement * entry.weight, 0) / totalWeight
        : 0

    return {
      total: filled.length,
      avgAchievement,
      weightedScore,
      totalWeight: items.reduce((sum, item) => sum + Math.max(0, Number(item.weight_percent) || 0), 0),
    }
  }, [items])

  function updateItem(id: string, patch: Partial<ProjectGoalItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addRow() {
    idRef.current += 1
    setItems((prev) => [...prev, createGoalItem(`goal-item-${idRef.current}`)])
  }

  function removeRow(id: string) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const res = await fetch(`/api/projects/${projectId}/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '목표 저장에 실패했습니다.')
      setNotice('프로젝트 목표 KPI가 저장되었습니다.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {warning}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="목표 항목" value={`${summary.total}`} helper="입력된 KPI rows 기준" />
        <SummaryCard label="평균 달성률" value={formatPercent(summary.avgAchievement)} helper="Target 대비 Actual 평균" />
        <SummaryCard label="가중 달성 점수" value={formatPercent(summary.weightedScore)} helper="가중치 반영 평균" />
        <SummaryCard label="가중치 총합" value={formatPercent(summary.totalWeight)} helper="100% 기준 권장" />
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Goal Sheet</p>
            <h3 className="mt-1 text-xl font-semibold text-gray-900">프로젝트 목표 KPI 설정</h3>
            <p className="mt-1 text-sm text-gray-500">
              행별로 KPI를 입력하고 Target 대비 Actual을 관리하세요. 숫자형 값이면 Gap과 최종평가를 자동 보조합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRow}
              className="theme-btn-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              행 추가
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="theme-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              저장
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <div className="min-w-[1340px]">
              <div
                className="grid border-b border-gray-200 bg-gray-100"
                style={{ gridTemplateColumns: `${COLUMNS.map((column) => column.width).join(' ')} 56px` }}
              >
                {COLUMNS.map((column) => (
                  <div key={column.key} className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {column.label}
                  </div>
                ))}
                <div className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  관리
                </div>
              </div>

              {items.map((item, index) => {
                const derivedGap = resolveDerivedGap(item)
                const derivedFinalEvaluation = resolveFinalEvaluation(item)
                return (
                  <div
                    key={item.id}
                    className="grid border-b border-gray-100 last:border-b-0 odd:bg-white even:bg-gray-50/60"
                    style={{ gridTemplateColumns: `${COLUMNS.map((column) => column.width).join(' ')} 56px` }}
                  >
                    <CellInput value={item.item} onChange={(value) => updateItem(item.id, { item: value })} placeholder={index === 0 ? '예: 총 방문자' : ''} />
                    <CellInput value={item.metric} onChange={(value) => updateItem(item.id, { metric: value })} placeholder="예: 방문 수" />
                    <CellSelect
                      value={item.evaluation_method}
                      onChange={(value) => updateItem(item.id, { evaluation_method: value })}
                      options={['정량', '정성']}
                    />
                    <CellInput value={item.unit} onChange={(value) => updateItem(item.id, { unit: value })} placeholder="명 / 건 / %" />
                    <CellInput value={item.target} onChange={(value) => updateItem(item.id, { target: value })} placeholder="목표값" />
                    <CellInput value={item.actual} onChange={(value) => updateItem(item.id, { actual: value })} placeholder="실적값" />
                    <CellInput
                      value={item.gap}
                      onChange={(value) => updateItem(item.id, { gap: value })}
                      placeholder={derivedGap || '자동 계산 또는 수동 입력'}
                    />
                    <CellInput
                      value={item.final_evaluation}
                      onChange={(value) => updateItem(item.id, { final_evaluation: value })}
                      placeholder={derivedFinalEvaluation || '자동 판정 또는 수동 입력'}
                    />
                    <CellInput
                      value={String(item.weight_percent || '')}
                      onChange={(value) => updateItem(item.id, { weight_percent: Number(value.replace(/[^0-9.]/g, '')) || 0 })}
                      placeholder="0"
                      inputMode="decimal"
                    />
                    <div className="flex items-center justify-center px-2">
                      <button
                        type="button"
                        onClick={() => removeRow(item.id)}
                        className="theme-btn-danger rounded-lg p-1.5"
                        aria-label="행 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function CellInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div className="border-r border-gray-100 last:border-r-0">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={inputCls}
      />
    </div>
  )
}

function CellSelect({
  value,
  onChange,
  options,
}: {
  value: '정량' | '정성'
  onChange: (value: '정량' | '정성') => void
  options: Array<'정량' | '정성'>
}) {
  return (
    <div className="border-r border-gray-100 px-2 py-2 last:border-r-0">
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as '정량' | '정성')}
          className={[
            'w-20 appearance-none rounded-full border px-3 text-center text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2',
            value === '정량'
              ? 'border-blue-700 bg-blue-600 text-white focus:ring-blue-200'
              : 'border-violet-700 bg-violet-600 text-white focus:ring-violet-200',
          ].join(' ')}
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-white text-gray-900">
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/90">
          ▾
        </span>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{helper}</p>
    </div>
  )
}
