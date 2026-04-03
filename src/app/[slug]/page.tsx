import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import PublicForm from '@/components/form/PublicForm'
import { getPublicFormFields, getPublicProjectBySlug } from '@/utils/public-content'
import { createPublicClient } from '@/utils/supabase/public'

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const data = await getPublicProjectBySlug(slug)
    if (!data) return {}

    const title = data.seo_title || data.title
    const image = data.seo_og_image || data.thumbnail_url || data.banner_url

    return {
      title,
      description: data.seo_description || undefined,
      openGraph: {
        title,
        description: data.seo_description || undefined,
        images: image ? [image] : undefined,
      },
    }
  } catch {
    return {}
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params
  const project = await getPublicProjectBySlug(slug)

  if (!project) notFound()

  if (project.is_published === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-8 text-center">
        <p className="text-2xl font-bold text-gray-700">비공개 페이지</p>
        <p className="text-sm text-gray-400">이 폼은 현재 비공개 상태입니다.</p>
      </div>
    )
  }

  if (project.deadline && new Date(project.deadline) < new Date()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-8 text-center">
        <p className="text-2xl font-bold text-gray-700">제출 마감</p>
        <p className="text-sm text-gray-400">이 폼의 제출 기간이 종료되었습니다.</p>
      </div>
    )
  }

  if (project.max_submissions) {
    const supabase = createPublicClient()
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)

    if ((count ?? 0) >= project.max_submissions) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-8 text-center">
          <p className="text-2xl font-bold text-gray-700">응답 마감</p>
          <p className="text-sm text-gray-400">최대 응답 수에 도달했습니다.</p>
        </div>
      )
    }
  }

  const fields = await getPublicFormFields(project.id)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {project.banner_url && (
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <Image src={project.banner_url} alt="배너 이미지" fill className="object-cover" priority />
        </div>
      )}

      <div className="mx-auto flex-1 w-full max-w-xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">{project.title}</h1>
        <PublicForm
          projectId={project.id}
          fields={fields}
          themeColor={project.theme_color ?? '#111827'}
          submissionMessage={project.submission_message}
          localeSettings={project.locale_settings ?? null}
        />
      </div>
    </div>
  )
}
