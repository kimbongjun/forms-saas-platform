import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import AccountForm from '@/components/dashboard/AccountForm'

export default async function AccountPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-base font-semibold text-gray-900">계정 설정</h1>
      <AccountForm
        email={user.email ?? ''}
        initialName={user.user_metadata?.name ?? ''}
        initialTeam={user.user_metadata?.team ?? ''}
      />
    </div>
  )
}
