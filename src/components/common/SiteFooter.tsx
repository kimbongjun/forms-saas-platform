import Link from 'next/link'
import { createServerClient } from '@/utils/supabase/server'
import { APP_TITLE } from '@/constants/branding'

export default async function SiteFooter() {
  let footerText = `© ${APP_TITLE}. All rights reserved.`

  try {
    const supabase = await createServerClient()
    const { data } = await supabase.from('site_settings').select('settings').eq('id', 1).single()
    footerText = data?.settings?.footer_text || footerText
  } catch {
    // use default
  }

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
        <Link href="/announcements" className="transition-colors hover:text-gray-600">공지사항</Link>
        <Link href="/release-notes" className="transition-colors hover:text-gray-600">릴리즈노트</Link>
        <Link href="/privacy" className="transition-colors hover:text-gray-600">개인정보처리방침</Link>
        <Link href="/terms" className="transition-colors hover:text-gray-600">이용약관</Link>
        <Link href="/service" className="transition-colors hover:text-gray-600">서비스이용동의</Link>
      </nav>
      <p className="text-xs text-gray-400">{footerText}</p>
    </footer>
  )
}
