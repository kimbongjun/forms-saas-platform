'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlignLeft, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

import BannerUpload from './BannerUpload'
import FieldCard, { FIELD_TYPE_META } from './FieldCard'
import { createClient } from '@/utils/supabase/client'
import { uploadBanner } from '@/utils/supabase/storage'
import type { FieldType, FormField, Project } from '@/types/database'

const SIDEBAR_TYPES: FieldType[] = [
  'text', 'email', 'textarea', 'checkbox',
  'select', 'radio', 'checkbox_group', 'html',
]

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

interface EditFormBuilderProps {
  project: Project & { id: string }
  initialFields: FormField[]
}

export default function EditFormBuilder({ project, initialFields }: EditFormBuilderProps) {
  const router = useRouter()
  const sensors = useSensors(useSensor(PointerSensor))

  const [title, setTitle] = useState(project.title)
  const [notificationEmail, setNotificationEmail] = useState(project.notification_email ?? '')
  const [fields, setFields] = useState<FormField[]>(initialFields)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(project.banner_url ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // ── Field operations ────────────────────────────────────────────────────────

  function addField(type: FieldType) {
    const needsOptions = ['select', 'radio', 'checkbox_group'].includes(type)
    setFields((prev) => [
      ...prev,
      {
        id: generateId(),
        label: '',
        type,
        required: false,
        order_index: prev.length,
        options: needsOptions ? [''] : undefined,
        content: type === 'html' ? '' : undefined,
      },
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

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id)
      const newIndex = prev.findIndex((f) => f.id === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((f, i) => ({ ...f, order_index: i }))
    })
  }

  // ── Banner ──────────────────────────────────────────────────────────────────

  function handleBannerFile(file: File) {
    setBannerFile(file)
    if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    setBannerPreview(URL.createObjectURL(file))
  }

  function handleBannerRemove() {
    setBannerFile(null)
    if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    setBannerPreview(null)
  }

  // ── handleUpdate ────────────────────────────────────────────────────────────

  async function handleUpdate() {
    if (!title.trim()) { setError('프로젝트 제목을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()

    try {
      let bannerUrl = project.banner_url ?? null
      if (bannerFile) {
        bannerUrl = await uploadBanner(supabase, bannerFile)
      } else if (!bannerPreview) {
        bannerUrl = null
      }

      const { error: updateErr } = await supabase
        .from('projects')
        .update({ title: title.trim(), banner_url: bannerUrl, notification_email: notificationEmail.trim() || null })
        .eq('id', project.id)
      if (updateErr) throw new Error(`프로젝트 수정 실패: ${updateErr.message}`)

      await supabase.from('form_fields').delete().eq('project_id', project.id)

      if (fields.length > 0) {
        const rows = fields.map((f) => ({
          project_id: project.id,
          label: f.label.trim() || '(제목 없음)',
          type: f.type,
          required: f.required,
          order_index: f.order_index,
          options: f.options ?? null,
          content: f.content ?? null,
        }))
        const { error: insertErr } = await supabase.from('form_fields').insert(rows)
        if (insertErr) throw new Error(`필드 저장 실패: ${insertErr.message}`)
      }

      setSaved(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success ─────────────────────────────────────────────────────────────────

  if (saved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-green-600">
        <CheckCircle2 className="h-14 w-14" />
        <p className="text-lg font-semibold">수정 완료!</p>
        <p className="text-sm text-gray-500">목록으로 돌아가는 중...</p>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-base font-semibold text-gray-900">프로젝트 편집</span>
            <span className="ml-2 text-xs text-gray-400">{project.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="max-w-xs truncate text-xs text-red-600">{error}</span>}
          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? '저장 중...' : '변경 저장'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-gray-200 bg-white px-3 py-5">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            필드 유형
          </p>
          {SIDEBAR_TYPES.map((type) => {
            const meta = FIELD_TYPE_META[type]
            return (
              <button
                key={type}
                type="button"
                onClick={() => addField(type)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 active:scale-95"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm ${meta.color}`}>
                  {meta.icon}
                </span>
                {meta.label}
              </button>
            )
          })}
          <div className="mt-auto rounded-xl border border-dashed border-gray-200 p-3 text-center text-xs leading-relaxed text-gray-400">
            클릭하면 캔버스에<br />필드가 추가됩니다
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-2xl space-y-6">

            <BannerUpload
              preview={bannerPreview}
              onFileChange={handleBannerFile}
              onRemove={handleBannerRemove}
            />

            <section className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  프로젝트 제목 <span className="text-red-400">*</span>
                </p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError('') }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  응답 알림 이메일
                </p>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="mt-1.5 text-xs text-gray-400">입력 시 폼 제출마다 해당 이메일로 응답 내용이 발송됩니다.</p>
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                폼 필드{' '}
                <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 font-normal text-gray-600">
                  {fields.length}
                </span>
              </p>

              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                  <AlignLeft className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-400">필드가 없습니다</p>
                  <p className="mt-1 text-xs text-gray-400">왼쪽 사이드바에서 추가하세요.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
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
                  </SortableContext>
                </DndContext>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
