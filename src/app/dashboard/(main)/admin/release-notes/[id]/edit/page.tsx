import { createServerClient, getUserRole } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ReleaseNoteForm from '../../ReleaseNoteForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditReleaseNotePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  const { data } = await supabase.from('release_notes').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <ReleaseNoteForm
      initialData={{ id: data.id, version: data.version, title: data.title, content: data.content }}
    />
  )
}
