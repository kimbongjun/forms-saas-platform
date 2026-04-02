import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { createServerClient, getUserRole } from '@/utils/supabase/server'
import AdminUserList from '@/components/dashboard/AdminUserList'

export default async function AdminUsersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-500" />
        <h1 className="text-base font-semibold text-gray-900">회원 관리</h1>
      </div>
      <AdminUserList />
    </div>
  )
}
