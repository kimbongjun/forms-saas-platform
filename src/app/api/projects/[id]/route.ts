import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createServerClient } from '@/utils/supabase/server'
import type { FormField, LocaleSettings } from '@/types/database'

interface UpdateProjectBody {
  title?: string
  notificationEmail?: string | null
  themeColor?: string | null
  isPublished?: boolean
  deadline?: string | null
  maxSubmissions?: number | null
  webhookUrl?: string | null
  submissionMessage?: string | null
  adminEmailTemplate?: string | null
  userEmailTemplate?: string | null
  thumbnailUrl?: string | null
  localeSettings?: LocaleSettings | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoOgImage?: string | null
  fields?: FormField[]
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await req.json()) as UpdateProjectBody
    const title = body.title?.trim()

    if (!title) {
      return NextResponse.json({ error: '프로젝트 제목을 입력해 주세요.' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: ownedProject, error: ownershipError } = await supabase
      .from('projects')
      .select('id, slug')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (ownershipError || !ownedProject) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 })
    }

    const projectPayload: Record<string, unknown> = {
      title,
      notification_email: body.notificationEmail?.trim() || null,
      theme_color: body.themeColor || '#111827',
      is_published: body.isPublished ?? true,
      deadline: body.deadline || null,
      max_submissions: body.maxSubmissions ?? null,
      webhook_url: body.webhookUrl?.trim() || null,
      submission_message: body.submissionMessage?.trim() || null,
      admin_email_template: body.adminEmailTemplate ?? null,
      user_email_template: body.userEmailTemplate ?? null,
      thumbnail_url: body.thumbnailUrl ?? null,
      locale_settings: body.localeSettings ?? null,
      seo_title: body.seoTitle?.trim() || null,
      seo_description: body.seoDescription?.trim() || null,
      seo_og_image: body.seoOgImage?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update(projectPayload)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: `프로젝트 수정 실패: ${updateError.message}` }, { status: 500 })
    }

    const { error: deleteError } = await supabase.from('form_fields').delete().eq('project_id', id)
    if (deleteError) {
      return NextResponse.json({ error: `필드 정리 실패: ${deleteError.message}` }, { status: 500 })
    }

    const fields = Array.isArray(body.fields) ? body.fields : []
    if (fields.length > 0) {
      const rows = fields.map((field, index) => {
        const row: Record<string, unknown> = {
          id: field.id,
          project_id: id,
          label: field.label.trim() || '(제목 없음)',
          description: field.description ?? null,
          type: field.type,
          required: field.required,
          order_index: field.order_index ?? index,
          options: field.options ?? null,
          content: field.content ?? null,
        }

        if (field.logic != null) row.logic = field.logic
        return row
      })

      const { error: insertError } = await supabase.from('form_fields').insert(rows)
      if (insertError) {
        return NextResponse.json({ error: `필드 저장 실패: ${insertError.message}` }, { status: 500 })
      }
    }

    revalidateTag('projects-public', 'max')
    return NextResponse.json({ id: ownedProject.id, slug: ownedProject.slug })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
