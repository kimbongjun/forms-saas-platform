import { createServerClient, getUserRole } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AnnouncementForm from '../../AnnouncementForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAnnouncementPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  const { data } = await supabase.from('announcements').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <AnnouncementForm
      initialData={{
        id: data.id,
        title: data.title,
        content: data.content,
        is_published: data.is_published,
        is_pinned: data.is_pinned,
      }}
    />
  )
}
