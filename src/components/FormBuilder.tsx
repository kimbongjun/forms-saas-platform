'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Type,
  AtSign,
  AlignLeft,
  CheckSquare,
  Trash2,
  GripVertical,
  ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FieldType, FormField } from '@/types/form'

// ── Constants ─────────────────────────────────────────────────────────────────

const FIELD_TYPES: {
  value: FieldType
  label: string
  icon: React.ReactNode
  placeholder: string
}[] = [
  { value: 'text',     label: '텍스트',      icon: <Type className="h-4 w-4" />,        placeholder: '예: 이름' },
  { value: 'email',    label: '이메일',       icon: <AtSign className="h-4 w-4" />,       placeholder: '예: 이메일 주소' },
  { value: 'textarea', label: '장문 텍스트',  icon: <AlignLeft className="h-4 w-4" />,    placeholder: '예: 의견을 입력해주세요' },
  { value: 'checkbox', label: '체크박스',     icon: <CheckSquare className="h-4 w-4" />,  placeholder: '예: 동의 여부' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function generateSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 40)
  return `${base}-${generateId()}`
}

// ── uploadBanner ──────────────────────────────────────────────────────────────

async function uploadBanner(supabase: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : generateId()
  const path = `project-banners/${uuid}.${ext}`

  const { error } = await supabase.storage
    .from('banners')
    .upload(path, file, { upsert: false })
  if (error) throw new Error(`배너 업로드 실패: ${error.message}`)

  return supabase.storage.from('banners').getPublicUrl(path).data.publicUrl
}

// ── FormBuilder ───────────────────────────────────────────────────────────────

export default function FormBuilder() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // ── Field operations ────────────────────────────────────────────────────────

  function addField(type: FieldType) {
    setFields((prev) => [
      ...prev,
      { id: generateId(), label: '', type, required: false, order_index: prev.length },
    ])
  }

  function removeField(id: string) {
    setFields((prev) =>
      prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, order_index: i }))
    )
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  // ── Banner ──────────────────────────────────────────────────────────────────

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setBannerFile(file)
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerPreview(file ? URL.createObjectURL(file) : null)
  }

  function removeBanner() {
    setBannerFile(null)
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── handleSave ──────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!title.trim()) {
      setError('프로젝트 제목을 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      // 1. Upload banner (01-SUPABASE-SCHEMA: project-banners/[uuid].[ext])
      const bannerUrl = bannerFile ? await uploadBanner(supabase, bannerFile) : null

      // 2. Insert project row → get id
      const slug = generateSlug(title)
      const { data: project, error: projectErr } = await supabase
        .from('projects')
        .insert({ title: title.trim(), slug, banner_url: bannerUrl })
        .select('id')
        .single()
      if (projectErr) throw new Error(`프로젝트 저장 실패: ${projectErr.message}`)

      // 3. Bulk insert form_fields (atomic save per 01-SUPABASE-SCHEMA)
      if (fields.length > 0) {
        const rows = fields.map((f) => ({
          project_id: project.id,
          label: f.label.trim() || '(제목 없음)',
          type: f.type,
          required: f.required,
          order_index: f.order_index,
        }))
        const { error: fieldsErr } = await supabase.from('form_fields').insert(rows)
        if (fieldsErr) throw new Error(`필드 저장 실패: ${fieldsErr.message}`)
      }

      setSaved(true)
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (saved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-green-600">
        <CheckCircle2 className="h-14 w-14" />
        <p className="text-lg font-semibold">저장 완료!</p>
        <p className="text-sm text-gray-500">홈으로 이동 중...</p>
      </div>
    )
  }

  // ── Main layout: Header + Sidebar + Canvas ──────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-base font-semibold text-gray-900">새 프로젝트 만들기</span>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-600 max-w-xs truncate">{error}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-gray-200 bg-white px-3 py-5">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            필드 유형
          </p>
          {FIELD_TYPES.map((ft) => (
            <button
              key={ft.value}
              type="button"
              onClick={() => addField(ft.value)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 active:scale-95"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                {ft.icon}
              </span>
              {ft.label}
            </button>
          ))}

          <div className="mt-auto rounded-xl border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
            버튼 클릭 시<br />캔버스에 추가됩니다
          </div>
        </aside>

        {/* ── Canvas ── */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-2xl space-y-6">

            {/* Banner Upload */}
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                배너 이미지
              </p>
              <div
                onClick={() => !bannerPreview && fileInputRef.current?.click()}
                className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
                  bannerPreview
                    ? 'border-transparent'
                    : 'cursor-pointer border-gray-200 bg-white hover:border-gray-400'
                }`}
                style={{ height: bannerPreview ? 'auto' : '160px' }}
              >
                {bannerPreview ? (
                  <>
                    <img
                      src={bannerPreview}
                      alt="배너 미리보기"
                      className="w-full rounded-2xl object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/70 transition-colors"
                    >
                      이미지 변경
                    </button>
                  </>
                ) : (
                  <div className="flex h-full select-none flex-col items-center justify-center gap-2">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">클릭하여 배너 이미지 업로드</p>
                    <p className="text-xs text-gray-400">PNG · JPG · WEBP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </section>

            {/* Project Title */}
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                프로젝트 제목 <span className="text-red-400">*</span>
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null) }}
                placeholder="예: 2024 고객 만족도 설문"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </section>

            {/* Field List */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  폼 필드{' '}
                  <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-gray-600">
                    {fields.length}
                  </span>
                </p>
              </div>

              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                  <AlignLeft className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-400">아직 필드가 없어요</p>
                  <p className="mt-1 text-xs text-gray-400">왼쪽 사이드바에서 필드를 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fields.map((field) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      onUpdate={(patch) => updateField(field.id, patch)}
                      onRemove={() => removeField(field.id)}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}

// ── FieldCard ─────────────────────────────────────────────────────────────────

function FieldCard({
  field,
  onUpdate,
  onRemove,
}: {
  field: FormField
  onUpdate: (patch: Partial<FormField>) => void
  onRemove: () => void
}) {
  const meta = FIELD_TYPES.find((t) => t.value === field.type)!

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Drag handle (visual only) */}
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />

      {/* Type badge */}
      <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        {meta.icon}
        {meta.label}
      </span>

      {/* Label input */}
      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder={meta.placeholder}
        className="flex-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      {/* Required toggle */}
      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-gray-500 select-none">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-3.5 w-3.5 rounded accent-gray-900"
        />
        필수
      </label>

      {/* Delete */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
