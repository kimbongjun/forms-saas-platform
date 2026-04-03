import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import type { FormField } from '@/types/database'

interface RouteContext {
  params: Promise<{ id: string }>
}

const INPUT_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select', 'radio', 'checkbox_group']

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: project }, { data: fields }, { data: submissions }] = await Promise.all([
    supabase.from('projects').select('title').eq('id', id).single(),
    supabase.from('form_fields').select('*').eq('project_id', id).order('order_index', { ascending: true }),
    supabase.from('submissions').select('*').eq('project_id', id).order('created_at', { ascending: true }),
  ])

  if (!project) return notFound()

  const inputFields: FormField[] = (fields ?? []).filter((field: FormField) => INPUT_TYPES.includes(field.type))
  const header = ['제출 시각', ...inputFields.map((field) => field.label || '(제목 없음)')].map(escapeCsv).join(',')

  const rows = (submissions ?? []).map((submission) => {
    const createdAt = new Date(submission.created_at).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    const columns = inputFields.map((field) => {
      const value = submission.answers?.[field.id]

      if (Array.isArray(value)) return escapeCsv(value.join(', '))
      if (typeof value === 'boolean') return value ? '동의' : '미동의'

      return escapeCsv(value != null ? String(value) : '')
    })

    return [escapeCsv(createdAt), ...columns].join(',')
  })

  const csv = '\uFEFF' + [header, ...rows].join('\n')
  const filename = encodeURIComponent(`${project.title}_responses.csv`)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
