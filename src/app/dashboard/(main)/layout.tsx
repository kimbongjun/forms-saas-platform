import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, getUserRole } from '@/utils/supabase/server'
import UserMenu from '@/components/dashboard/UserMenu'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardMainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [role, settingsData] = await Promise.all([
    getUserRole(user.id),
    supabase.from('site_settings').select('settings').eq('id', 1).single(),
  ])
  const siteName = settingsData.data?.settings?.site_title || '클래시스 폼'
  const footerText = settingsData.data?.settings?.footer_text || '© CLASSYS. All rights reserved.'

  return (
    <div className="flex h-screen flex-col">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors">
          {siteName}
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/announcements" className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            공지사항
          </Link>
          <Link href="/release-notes" className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            릴리즈노트
          </Link>
        </nav>
        <UserMenu email={user.email ?? ''} role={role} />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="flex h-10 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
        </div>
        <p>{footerText}</p>
        <div />
      </footer>
    </div>
  )
}
