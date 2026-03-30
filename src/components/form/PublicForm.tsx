'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { FormField } from '@/types/database'

interface PublicFormProps {
  projectId: string
  fields: FormField[]
}

export default function PublicForm({ projectId, fields }: PublicFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | boolean | string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function setAnswer(fieldId: string, value: string | boolean | string[]) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  function toggleCheckboxGroup(fieldId: string, option: string) {
    const current = (answers[fieldId] as string[] | undefined) ?? []
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option]
    setAnswer(fieldId, next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // 필수 필드 검증
    for (const field of fields) {
      if (field.type === 'html') continue
      if (!field.required) continue
      const val = answers[field.id]
      const isEmpty =
        val === undefined ||
        val === '' ||
        val === false ||
        (Array.isArray(val) && val.length === 0)
      if (isEmpty) {
        setError(`'${field.label || '(제목 없음)'}' 항목은 필수입니다.`)
        return
      }
    }

    setLoading(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          answers,
          fields: fields.map((f) => ({ id: f.id, label: f.label, type: f.type })),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '제출에 실패했습니다.')

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-green-600">
        <CheckCircle2 className="h-14 w-14" />
        <p className="text-lg font-semibold">제출이 완료되었습니다!</p>
        <p className="text-sm text-gray-500">응답해주셔서 감사합니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={answers[field.id]}
          onChange={(v) => setAnswer(field.id, v)}
          onToggleCheckbox={(opt) => toggleCheckboxGroup(field.id, opt)}
        />
      ))}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? '제출 중...' : '제출하기'}
      </button>
    </form>
  )
}

// ── 개별 필드 렌더러 ──────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormField
  value: string | boolean | string[] | undefined
  onChange: (v: string | boolean | string[]) => void
  onToggleCheckbox: (option: string) => void
}

function FieldRenderer({ field, value, onChange, onToggleCheckbox }: FieldRendererProps) {
  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900'

  if (field.type === 'html') {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: field.content ?? '' }}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-800">
        {field.label || '(제목 없음)'}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        />
      )}

      {field.type === 'email' && (
        <input
          type="email"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          rows={4}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={`${inputClass} resize-y`}
        />
      )}

      {field.type === 'checkbox' && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={(value as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded accent-gray-900"
          />
          동의합니다
        </label>
      )}

      {field.type === 'select' && (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        >
          <option value="">선택하세요</option>
          {(field.options ?? []).filter(Boolean).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="space-y-2">
          {(field.options ?? []).filter(Boolean).map((opt, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={(value as string) === opt}
                onChange={() => onChange(opt)}
                required={field.required}
                className="h-4 w-4 accent-gray-900"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox_group' && (
        <div className="space-y-2">
          {(field.options ?? []).filter(Boolean).map((opt, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={((value as string[]) ?? []).includes(opt)}
                onChange={() => onToggleCheckbox(opt)}
                className="h-4 w-4 rounded accent-gray-900"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
