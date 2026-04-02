'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const RichTextEditor = dynamic(() => import('@/components/builder/RichTextEditor'), { ssr: false })

interface SiteSettings {
  site_title?: string
  site_description?: string
  favicon_url?: string
  og_image_url?: string
  footer_text?: string
  max_file_size_mb?: number
  allowed_domains?: string
  privacy_policy?: string
  terms_of_service?: string
  service_agreement?: string
}

interface Props {
  initialSettings: SiteSettings
}

const LEGAL_SECTIONS: Array<{ key: keyof SiteSettings; title: string; desc: string }> = [
  { key: 'privacy_policy', title: '개인정보처리방침', desc: '공개 URL: /privacy' },
  { key: 'terms_of_service', title: '이용약관', desc: '공개 URL: /terms' },
  { key: 'service_agreement', title: '서비스이용동의', desc: '공개 URL: /service' },
]

export default function AdminSettingsForm({ initialSettings }: Props) {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: '',
    site_description: '',
    favicon_url: '',
    og_image_url: '',
    footer_text: '',
    max_file_size_mb: 5,
    allowed_domains: '',
    privacy_policy: '',
    terms_of_service: '',
    service_agreement: '',
    ...initialSettings,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'legal'>('general')

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '저장 실패')
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900'

  return (
    <div>
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/users" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-gray-900">글로벌 사이트 설정</h1>
              <p className="text-xs text-gray-400">전체 플랫폼에 적용되는 설정을 관리합니다</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl px-6">
          {(['general', 'legal'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700',
              ].join(' ')}
            >
              {tab === 'general' ? '일반 설정' : '약관 관리'}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            설정이 저장되었습니다.
          </div>
        )}

        {activeTab === 'general' && (
          <>
            {/* SEO / 메타 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">SEO / 메타 정보</h2>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">사이트 제목</label>
                <input type="text" value={settings.site_title ?? ''} onChange={(e) => set('site_title', e.target.value)} placeholder="클래시스 폼 생성 템플릿" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">사이트 설명 (meta description)</label>
                <textarea rows={2} value={settings.site_description ?? ''} onChange={(e) => set('site_description', e.target.value)} placeholder="설문을 생성하고 관리하는 플랫폼입니다." className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">OG 이미지 URL</label>
                <input type="url" value={settings.og_image_url ?? ''} onChange={(e) => set('og_image_url', e.target.value)} placeholder="https://..." className={inputClass} />
              </div>
            </section>

            {/* 파비콘 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">파비콘</h2>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">파비콘 URL (.ico, .png, .svg)</label>
                <input type="url" value={settings.favicon_url ?? ''} onChange={(e) => set('favicon_url', e.target.value)} placeholder="https://..." className={inputClass} />
                {settings.favicon_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.favicon_url} alt="favicon preview" className="mt-2 h-8 w-8 rounded object-contain border border-gray-200 p-0.5" />
                )}
              </div>
            </section>

            {/* 기타 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">기타</h2>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">푸터 문구</label>
                <input type="text" value={settings.footer_text ?? ''} onChange={(e) => set('footer_text', e.target.value)} placeholder="© 2025 CLASSYS. All rights reserved." className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">파일 업로드 최대 크기 (MB)</label>
                <input type="number" min={1} max={50} value={settings.max_file_size_mb ?? 5} onChange={(e) => set('max_file_size_mb', Number(e.target.value))} className={inputClass} />
              </div>
            </section>
          </>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-8">
            <p className="text-sm text-gray-500">각 약관은 공개 URL로 접근 가능하며, 회원가입 시 동의 항목으로 표시됩니다.</p>
            {LEGAL_SECTIONS.map(({ key, title, desc }) => (
              <section key={key} className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                  <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
                </div>
                <RichTextEditor
                  content={settings[key] as string ?? ''}
                  onChange={(html) => set(key, html)}
                  height="400px"
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
