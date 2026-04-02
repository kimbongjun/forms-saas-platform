import { createServerClient } from '@/utils/supabase/server'
import SiteHeader from '@/components/common/SiteHeader'
import SiteFooter from '@/components/common/SiteFooter'

export default async function PrivacyPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('site_settings').select('settings').eq('id', 1).single()
  const s = data?.settings ?? {}

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-base font-semibold text-gray-900">개인정보처리방침</h1>
        </div>
      </div>
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        {s.privacy_policy ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.privacy_policy }} />
        ) : (
          <p className="text-sm text-gray-400">개인정보처리방침이 아직 등록되지 않았습니다.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
