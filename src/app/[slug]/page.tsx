import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createServerClient } from '@/utils/supabase/server'
import PublicForm from '@/components/form/PublicForm'

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params
  const supabase = createServerClient()

  const [{ data: project, error: projectErr }, ] = await Promise.all([
    supabase.from('projects').select('*').eq('slug', slug).single(),
  ])

  if (projectErr || !project) notFound()

  const { data: fields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('project_id', project.id)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 배너 */}
      {project.banner_url && (
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <Image
            src={project.banner_url}
            alt="배너 이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-xl px-4 py-10">

        {/* 제목 */}
        <h1 className="mb-8 text-2xl font-bold text-gray-900">{project.title}</h1>

        {/* 공개용 폼 */}
        <PublicForm projectId={project.id} fields={fields ?? []} />

      </div>
    </div>
  )
}
