import WorkspaceShell from '@/components/workspace/WorkspaceShell'
import { createServerClient } from '@/utils/supabase/server'

export default async function TermsPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('site_settings').select('settings').eq('id', 1).single()
  const s = data?.settings ?? {}

  return (
    <WorkspaceShell>
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-base font-semibold text-gray-900">이용약관</h1>
        </div>
      </div>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {s.terms_of_service ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.terms_of_service }} />
        ) : (
          <p className="text-sm text-gray-400">이용약관이 아직 등록되지 않았습니다.</p>
        )}
      </main>
    </WorkspaceShell>
  )
}
