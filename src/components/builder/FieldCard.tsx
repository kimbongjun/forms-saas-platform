'use client'

import dynamic from 'next/dynamic'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Trash2, Plus, X,
  Type, AtSign, AlignLeft, CheckSquare,
  ChevronDown, CircleDot, LayoutList, Code2,
} from 'lucide-react'
import type { FormField, FieldType } from '@/types/database'

// WYSIWYG 에디터는 SSR 제외 (tiptap은 브라우저 전용)
const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

// ── Field type metadata ───────────────────────────────────────────────────────

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  text:          { label: '텍스트',      icon: <Type className="h-3.5 w-3.5" />,        color: 'bg-blue-100 text-blue-700' },
  email:         { label: '이메일',       icon: <AtSign className="h-3.5 w-3.5" />,       color: 'bg-purple-100 text-purple-700' },
  textarea:      { label: '장문',         icon: <AlignLeft className="h-3.5 w-3.5" />,    color: 'bg-indigo-100 text-indigo-700' },
  checkbox:      { label: '체크박스',     icon: <CheckSquare className="h-3.5 w-3.5" />,  color: 'bg-green-100 text-green-700' },
  select:        { label: '셀렉박스',     icon: <ChevronDown className="h-3.5 w-3.5" />,  color: 'bg-orange-100 text-orange-700' },
  radio:         { label: '라디오',       icon: <CircleDot className="h-3.5 w-3.5" />,    color: 'bg-pink-100 text-pink-700' },
  checkbox_group:{ label: '체크박스 그룹', icon: <LayoutList className="h-3.5 w-3.5" />,   color: 'bg-teal-100 text-teal-700' },
  html:          { label: 'HTML',         icon: <Code2 className="h-3.5 w-3.5" />,         color: 'bg-gray-200 text-gray-700' },
}

const MULTI_OPTION_TYPES: FieldType[] = ['select', 'radio', 'checkbox_group']

// ── FieldCard ─────────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: FormField
  onUpdate: (patch: Partial<FormField>) => void
  onRemove: () => void
}

export default function FieldCard({ field, onUpdate, onRemove }: FieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = FIELD_TYPE_META[field.type]
  const isMultiOption = MULTI_OPTION_TYPES.includes(field.type)
  const isHtml = field.type === 'html'

  // ── Options helpers ───────────────────────────────────────────────────────

  function addOption() {
    onUpdate({ options: [...(field.options ?? []), ''] })
  }

  function updateOption(i: number, value: string) {
    const next = [...(field.options ?? [])]
    next[i] = value
    onUpdate({ options: next })
  }

  function removeOption(i: number) {
    onUpdate({ options: (field.options ?? []).filter((_, idx) => idx !== i) })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-xl border bg-white shadow-sm transition-shadow',
        isDragging
          ? 'border-gray-400 shadow-xl opacity-80 z-50'
          : 'border-gray-200 hover:shadow-md',
      ].join(' ')}
    >
      {/* ── Header row ── */}
      <div className="flex items-center gap-2 px-3 py-3">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Type badge */}
        <span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${meta.color}`}>
          {meta.icon}
          {meta.label}
        </span>

        {/* Label input (not shown for html type) */}
        {!isHtml && (
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="필드 레이블"
            className="flex-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        )}

        {/* Required toggle (not shown for html type) */}
        {!isHtml && (
          <label className="flex shrink-0 cursor-pointer select-none items-center gap-1.5 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="h-3.5 w-3.5 rounded accent-gray-900"
            />
            필수
          </label>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Multi-option section ── */}
      {isMultiOption && (
        <div className="border-t border-gray-100 px-10 pb-3 pt-2 space-y-1.5">
          <p className="mb-1.5 text-xs font-medium text-gray-400">선택지</p>

          {(field.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* 타입별 앞 아이콘 */}
              <span className="shrink-0 text-gray-300">
                {field.type === 'radio' && <CircleDot className="h-3.5 w-3.5" />}
                {field.type === 'checkbox_group' && <CheckSquare className="h-3.5 w-3.5" />}
                {field.type === 'select' && <ChevronDown className="h-3.5 w-3.5" />}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`옵션 ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            <Plus className="h-3.5 w-3.5" />
            옵션 추가
          </button>
        </div>
      )}

      {/* ── WYSIWYG editor section ── */}
      {isHtml && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <RichTextEditor
            content={field.content ?? ''}
            onChange={(html) => onUpdate({ content: html })}
            placeholder="HTML 내용을 입력하세요..."
          />
        </div>
      )}
    </div>
  )
}
