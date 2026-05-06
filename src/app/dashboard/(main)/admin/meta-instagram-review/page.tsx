import { redirect } from 'next/navigation'
import MetaInstagramReviewClient from './MetaInstagramReviewClient'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

export default async function MetaInstagramReviewPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  return <MetaInstagramReviewClient />
}
