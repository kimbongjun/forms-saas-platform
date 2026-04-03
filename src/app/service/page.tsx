import PublicSiteFrame from '@/components/common/PublicSiteFrame'
import { getGlobalSiteSettings } from '@/utils/site-settings'

export default async function ServicePage() {
  const s = await getGlobalSiteSettings()

  return (
    <PublicSiteFrame>
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-base font-semibold text-gray-900">서비스이용동의</h1>
        </div>
      </div>
      <section className="mx-auto w-full max-w-3xl px-6 py-10">
        {s.service_agreement ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.service_agreement }} />
        ) : (
          <p className="text-sm text-gray-400">서비스이용동의가 아직 등록되지 않았습니다.</p>
        )}
      </section>
    </PublicSiteFrame>
  )
}
