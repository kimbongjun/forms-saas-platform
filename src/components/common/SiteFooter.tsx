import { createServerClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function SiteFooter() {
  let footerText = '© CLASSYS. All rights reserved.'
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.from('site_settings').select('settings').eq('id', 1).single()
    footerText = data?.settings?.footer_text || footerText
  } catch { /* use default */ }

  return (
    <footer className="border-t border-gray-200 bg-white py-6 px-4 text-center">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
        <Link href="/announcements" className="hover:text-gray-600 transition-colors">공지사항</Link>
        <Link href="/release-notes" className="hover:text-gray-600 transition-colors">릴리즈노트</Link>
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
        <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
        <Link href="/service" className="hover:text-gray-600 transition-colors">서비스이용동의</Link>
      </nav>
      <p className="text-xs text-gray-400">{footerText}</p>
    </footer>
  )
}
