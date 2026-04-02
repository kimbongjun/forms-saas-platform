import { createServerClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PrivacyPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('site_settings').select('settings').eq('id', 1).single()
  const s = data?.settings ?? {}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link href="/" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">개인정보처리방침</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        {s.privacy_policy ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.privacy_policy }} />
        ) : (
          <p className="text-sm text-gray-400">개인정보처리방침이 아직 등록되지 않았습니다.</p>
        )}
      </main>
    </div>
  )
}
