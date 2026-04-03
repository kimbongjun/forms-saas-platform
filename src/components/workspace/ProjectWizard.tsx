'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, Users } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// ── 상수 ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'PR', label: 'PR', description: '언론 홍보 및 미디어 커버리지' },
  { key: '디지털 마케팅', label: '디지털 마케팅', description: 'SNS·검색광고·콘텐츠 마케팅' },
  { key: '바이럴', label: '바이럴', description: '입소문 캠페인 및 UGC 활용' },
  { key: 'HCP 마케팅', label: 'HCP 마케팅', description: '의료 전문가 대상 마케팅' },
  { key: 'B2B 마케팅', label: 'B2B 마케팅', description: '기업 간 거래 및 파트너십' },
]

const ROLE_OPTIONS = [
  { value: 'owner', label: '오너' },
  { value: 'manager', label: '매니저' },
  { value: 'member', label: '멤버' },
  { value: 'viewer', label: '뷰어' },
]

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface WizardMember {
  _key: string
  name: string
  email: string
  role: string
  department: string
  notify: boolean
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function randomSlug() {
  return `proj-${Math.random().toString(36).slice(2, 8)}`
}

function newMember(): WizardMember {
  return { _key: crypto.randomUUID(), name: '', email: '', role: 'member', department: '', notify: true }
}

// ── 입력 클래스 ───────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900'

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function ProjectWizard() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [members, setMembers] = useState<WizardMember[]>([newMember()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── 멤버 핸들러 ────────────────────────────────────────────────────────────

  function updateMember(key: string, patch: Partial<WizardMember>) {
    setMembers((prev) => prev.map((m) => (m._key === key ? { ...m, ...patch } : m)))
  }

  function addMember() {
    setMembers((prev) => [...prev, newMember()])
  }

  function removeMember(key: string) {
    setMembers((prev) => prev.filter((m) => m._key !== key))
  }

  // ── 저장 ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()

      const { data: project, error: projectErr } = await supabase
        .from('projects')
        .insert({
          title: title.trim(),
          slug: randomSlug(),
          category,
          start_date: startDate || null,
          end_date: endDate || null,
          budget: budget ? Number(budget) : null,
        })
        .select('id')
        .single()

      if (projectErr) throw projectErr

      const validMembers = members.filter((m) => m.name.trim())
      if (validMembers.length > 0) {
        const { error: membersErr } = await supabase
          .from('project_members')
          .insert(
            validMembers.map((m) => ({
              project_id: project.id,
              name: m.name.trim(),
              email: m.email.trim() || null,
              role: m.role,
              department: m.department.trim() || null,
              notify: m.notify,
            }))
          )
        if (membersErr) throw membersErr
      }

      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 생성에 실패했습니다.')
      setLoading(false)
    }
  }

  // ── 스텝 진행 유효성 ───────────────────────────────────────────────────────

  const step1Valid = !!category
  const step2Valid = title.trim().length > 0

  // ── 렌더 ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-3">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                s < step
                  ? 'bg-emerald-500 text-white'
                  : s === step
                  ? 'brand-active'
                  : 'bg-gray-100 text-gray-400',
              ].join(' ')}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className={['text-sm font-medium', s === step ? 'text-gray-900' : 'text-gray-400'].join(' ')}>
              {s === 1 ? 'Category' : s === 2 ? 'Basic Setup' : 'Team Assign'}
            </span>
            {s < 3 && <div className="h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Category ── */}
      {step === 1 && (
        <section className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">카테고리 선정</h2>
            <p className="mt-2 text-sm text-gray-500">프로젝트의 마케팅 유형을 선택하세요.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={[
                  'rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md',
                  category === cat.key
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300',
                ].join(' ')}
              >
                <p className="text-sm font-semibold">{cat.label}</p>
                <p className={['mt-1 text-xs', category === cat.key ? 'text-gray-300' : 'text-gray-400'].join(' ')}>
                  {cat.description}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* ── Step 2: Basic Setup ── */}
      {step === 2 && (
        <section className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Step 2 · {category}</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">기본 정보</h2>
            <p className="mt-2 text-sm text-gray-500">프로젝트의 핵심 정보를 입력하세요.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">프로젝트명 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="프로젝트 이름을 입력하세요"
                className={inputCls}
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">초기 예산 (원)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                min={0}
                className={inputCls}
              />
              {budget && (
                <p className="mt-1 text-xs text-gray-400">
                  {Number(budget).toLocaleString('ko-KR')}원
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </button>
            <button
              type="button"
              disabled={!step2Valid}
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* ── Step 3: Team Assign ── */}
      {step === 3 && (
        <section className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Step 3 · {category}</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">팀 구성</h2>
            <p className="mt-2 text-sm text-gray-500">
              프로젝트 멤버와 역할을 설정합니다. 이름 미입력 항목은 저장되지 않습니다.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-1 text-xs font-medium text-gray-400">
              <span>이름 *</span>
              <span>이메일</span>
              <span className="w-24">역할</span>
              <span className="w-28">부서</span>
              <span className="w-8" />
            </div>

            {members.map((m) => (
              <div key={m._key} className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-2">
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMember(m._key, { name: e.target.value })}
                  placeholder="홍길동"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="email"
                  value={m.email}
                  onChange={(e) => updateMember(m._key, { email: e.target.value })}
                  placeholder="email@company.com"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <select
                  value={m.role}
                  onChange={(e) => updateMember(m._key, { role: e.target.value })}
                  className="w-24 rounded-xl border border-gray-200 px-2 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={m.department}
                  onChange={(e) => updateMember(m._key, { department: e.target.value })}
                  placeholder="마케팅팀"
                  className="w-28 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => removeMember(m._key)}
                  disabled={members.length === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="h-4 w-4" />
              멤버 추가
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              <span>멤버는 프로젝트 생성 후 언제든지 추가/수정할 수 있습니다.</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> 생성 중...</>
              ) : (
                <><Check className="h-4 w-4" /> 프로젝트 생성</>
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
