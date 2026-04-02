import { createServerClient, getUserRole } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ReleaseNoteForm from '../ReleaseNoteForm'

export default async function NewReleaseNotePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  return <ReleaseNoteForm />
}
