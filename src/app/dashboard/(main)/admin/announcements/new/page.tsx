import { createServerClient, getUserRole } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AnnouncementForm from '../AnnouncementForm'

export default async function NewAnnouncementPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  return <AnnouncementForm />
}
