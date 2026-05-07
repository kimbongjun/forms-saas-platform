'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Film,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Unplug,
} from 'lucide-react'
import { useMetaDemo, useMetaDisconnect, useMetaStatus } from '@/hooks/queries/useMetaIntegration'

const REVIEW_SCENARIO = [
  '1. 관리자 로그인 상태에서 Meta Review Console 화면을 연다.',
  '2. Connect with Meta 버튼을 눌러 Facebook Login을 시작한다.',
  '3. pages_show_list, pages_read_engagement, instagram_basic 권한 승인 화면을 보여준다.',
  '4. 연결 완료 후 Facebook Page와 Instagram Business 계정이 식별된 상태를 보여준다.',
  '5. Run API Demo를 눌러 프로필, 최근 미디어, 해시태그 검색 결과를 보여준다.',
  '6. 마지막으로 deliverables 기능에서 왜 이 API가 필요한지 설명한다.',
]

export default function MetaInstagramReviewClient() {
  const searchParams = useSearchParams()
  const [hashtag, setHashtag] = useState('classys')

  const { data: status, isLoading: loading, error: statusError, refetch: refetchStatus } = useMetaStatus()
  const demoMutation = useMetaDemo(hashtag)
  const disconnectMutation = useMetaDisconnect()

  const demo = demoMutation.data ?? null
  const demoLoading = demoMutation.isPending
  const disconnecting = disconnectMutation.isPending
  const error = statusError?.message ?? demoMutation.error?.message ?? disconnectMutation.error?.message ?? ''

  const ERROR_HINTS: Record<string, string> = {
    missing_instagram_business_account:
      'Instagram Business 계정을 찾지 못했습니다. ① Facebook Page에 Instagram 비즈니스 계정이 연결되어 있는지 확인하세요. ② OAuth한 Facebook 사용자가 해당 Page의 Admin인지 확인하세요. ③ Meta for Developers 앱에 instagram_manage_insights 권한이 추가되어 있어야 합니다.',
    invalid_oauth_state: 'OAuth state 불일치 — 브라우저를 새로고침하고 다시 시도하세요.',
    integration_save_failed: 'DB 저장 실패 — social_integrations 테이블이 존재하는지 확인하세요.',
  }

  type DiagInfo = {
    page_count: string
    pages: string
    ig_field_present: string
    scopes: string
  }

  const callbackMessage = useMemo(() => {
    if (searchParams.get('connected') === '1') return { type: 'success' as const, text: 'Meta 연결이 완료되었습니다.', hint: undefined, diag: undefined }
    const callbackError = searchParams.get('error')
    if (callbackError) {
      const hint = Object.entries(ERROR_HINTS).find(([key]) => callbackError.startsWith(key))?.[1]
      const diagPageCount = searchParams.get('diag_page_count')
      const diag: DiagInfo | undefined = diagPageCount
        ? {
            page_count: diagPageCount,
            pages: searchParams.get('diag_pages') ?? '(none)',
            ig_field_present: searchParams.get('diag_ig_field_present') ?? 'unknown',
            scopes: searchParams.get('diag_scopes') ?? '(none)',
          }
        : undefined
      return { type: 'error' as const, text: `Meta 연결 오류: ${callbackError}`, hint, diag }
    }
    return null
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  function loadStatus() { void refetchStatus() }
  function runDemo() { demoMutation.mutate() }
  function disconnect() { disconnectMutation.mutate() }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/admin/settings" className="text-sm text-gray-500 hover:text-gray-700">
            ← 사이트 설정
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Meta Instagram Review Console</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            Instagram Graph API 심사 영상에서 보여줄 로그인, 권한 승인, 계정 연결, 실제 API 사용 흐름을 검증하는
            관리자용 콘솔입니다.
          </p>
        </div>
        <button
          onClick={loadStatus}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          새로고침
        </button>
      </div>

      {callbackMessage ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          callbackMessage.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}>
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">{callbackMessage.text}</p>
              {callbackMessage.hint ? (
                <p className="text-xs leading-relaxed opacity-80">{callbackMessage.hint}</p>
              ) : null}
            </div>
          </div>
          {callbackMessage.diag ? (
            <div className="mt-3 rounded-xl bg-white/60 p-3 text-xs font-mono space-y-1 border border-rose-100">
              <p className="font-semibold text-rose-800 not-italic font-sans mb-2">API 진단 정보</p>
              <p><span className="text-rose-400">page_count:</span> {callbackMessage.diag.page_count}</p>
              <p><span className="text-rose-400">pages:</span> {callbackMessage.diag.pages}</p>
              <p>
                <span className="text-rose-400">instagram_business_account 필드 존재:</span>{' '}
                <span className={callbackMessage.diag.ig_field_present === 'true' ? 'text-amber-600' : 'text-rose-600'}>
                  {callbackMessage.diag.ig_field_present}
                </span>
              </p>
              <p><span className="text-rose-400">granted_scopes:</span> {callbackMessage.diag.scopes}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Need assessment</p>
          <h2 className="mt-2 text-lg font-bold text-gray-900">이 프로젝트에는 Meta 연동 근거가 있습니다.</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            현재 `deliverables` 검색에서 Instagram `#해시태그`는 공식 API를 우선 사용하도록 이미 설계되어 있습니다.
            다만 지금은 수동 토큰 주입 방식이라 앱 심사 영상에 필요한 사용자 승인 플로우가 없습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Review gap</p>
          <h2 className="mt-2 text-lg font-bold text-gray-900">심사 영상 요건과 현재 구조는 다릅니다.</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            리뷰어는 로그인, 권한 승인, 실제 API 사용을 봐야 하는데, 기존 구조는 `.env.local` 토큰만 읽는 서버
            방식이라 중간 과정을 증빙할 화면이 없습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Implementation</p>
          <h2 className="mt-2 text-lg font-bold text-gray-900">그래서 연결 전용 콘솔을 추가했습니다.</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            이 페이지에서 Meta OAuth 연결, 권한 확인, Instagram Business 프로필 조회, 최근 미디어 조회,
            해시태그 검색 데모까지 수행할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Connection Status</h2>
            <p className="mt-1 text-sm text-gray-500">Meta 앱 자격증명과 현재 연결 상태를 확인합니다.</p>
          </div>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            title="FACEBOOK_APP_ID / SECRET"
            value={status?.envConfigured ? 'Configured' : 'Missing'}
            active={Boolean(status?.envConfigured)}
          />
          <StatusCard
            title="OAuth connection"
            value={status?.connection ? 'Connected' : 'Not connected'}
            active={Boolean(status?.connection)}
          />
          <StatusCard
            title="Facebook Page"
            value={status?.connection?.facebook_page_name ?? '-'}
            active={Boolean(status?.connection?.facebook_page_id)}
          />
          <StatusCard
            title="Instagram Business"
            value={status?.connection?.instagram_username ?? '-'}
            active={Boolean(status?.connection?.instagram_business_account_id)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/api/integrations/meta/start"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white ${
              status?.envConfigured ? 'bg-[#1877F2] hover:bg-[#1665d8]' : 'pointer-events-none bg-gray-300'
            }`}
          >
            <Link2 className="h-4 w-4" />
            Connect with Meta
          </a>
          <button
            onClick={disconnect}
            disabled={disconnecting}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
            Disconnect
          </button>
          <a
            href="/api/integrations/meta/debug"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 hover:bg-amber-100"
          >
            <Search className="h-4 w-4" />
            Debug (Raw API)
          </a>
          <a
            href="https://developers.facebook.com/docs/app-review/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Meta App Review Docs
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {status?.connection?.scopes?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {status.connection.scopes.map((scope) => (
              <span key={scope} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {scope}
              </span>
            ))}
          </div>
        ) : null}

        {!status?.connection ? (
          <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">연결 전 체크리스트</p>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed">
              <li>Meta for Developers 앱에 <strong>instagram_manage_insights</strong> 권한이 추가되어 있어야 합니다.</li>
              <li>Facebook 앱 설정 → &ldquo;Instagram&rdquo; 제품이 추가되어 있어야 합니다.</li>
              <li>Facebook Page와 Instagram Business Account가 서로 연결되어 있어야 합니다 (Instagram 계정 설정 → 연결된 계정).</li>
              <li>OAuth하는 Facebook 사용자가 해당 Facebook Page의 <strong>관리자(Admin)</strong>여야 합니다 (편집자/분석자 불가).</li>
              <li>Instagram 계정이 <strong>비즈니스 계정</strong>이어야 합니다 (개인 계정 불가).</li>
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-blue-700" />
          <h2 className="text-base font-semibold text-gray-900">Review Video Script</h2>
        </div>
        <div className="mt-4 space-y-2">
          {REVIEW_SCENARIO.map((line) => (
            <div key={line} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {line}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-gray-900">Run API Demo</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          연결 후 이 버튼을 눌러 Instagram Business 프로필, 최근 미디어, 해시태그 검색 결과를 보여주면 심사 영상의
          API 활용 근거가 됩니다.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={hashtag}
              onChange={(event) => setHashtag(event.target.value)}
              placeholder="classys"
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <button
            onClick={runDemo}
            disabled={!status?.connection || demoLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Run API Demo
          </button>
        </div>

        {demo ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">Profile</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoLine label="Username" value={demo.profile?.username ?? '-'} />
                  <InfoLine label="Name" value={demo.profile?.name ?? '-'} />
                  <InfoLine label="Followers" value={String(demo.profile?.followers_count ?? '-')} />
                  <InfoLine label="Media count" value={String(demo.profile?.media_count ?? '-')} />
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">Granted permissions</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {demo.permissions.map((permission) => (
                    <span
                      key={`${permission.permission}-${permission.status}`}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        permission.status === 'granted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {permission.permission}: {permission.status}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Why this matters to the project</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                <li>Instagram `#해시태그` 검색은 현재 deliverables 후보 검색 기능과 직접 연결됩니다.</li>
                <li>권한 승인 후 받은 토큰으로 실제 Business 계정의 데이터가 조회된다는 점을 영상으로 증명할 수 있습니다.</li>
                <li>현재 코드의 `.env.local` 고정 토큰 방식을 앱 심사용 사용자 연결 플로우로 보완합니다.</li>
              </ul>
            </div>

            <div className="xl:col-span-2">
              <MediaGrid title="Recent media" items={demo.recentMedia} emptyText="최근 미디어가 없습니다." />
            </div>

            <div className="xl:col-span-2">
              <MediaGrid
                title={`#${demo.hashtag} hashtag demo`}
                items={demo.hashtagMedia}
                emptyText="해시태그 결과가 없거나 권한/계정 조건이 맞지 않습니다."
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function StatusCard({ title, value, active }: { title: string; value: string; active: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
      <p className={`mt-2 text-xs font-medium ${active ? 'text-emerald-600' : 'text-amber-600'}`}>
        {active ? 'Ready' : 'Needs action'}
      </p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

function MediaGrid({
  title,
  items,
  emptyText,
}: {
  title: string
  items: Array<{
    id: string
    caption?: string
    media_type?: string
    media_url?: string
    thumbnail_url?: string
    permalink?: string
    timestamp?: string
    like_count?: number
    comments_count?: number
  }>
  emptyText: string
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.permalink ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-gray-300"
            >
              <div className="aspect-[4/3] bg-gray-100">
                {item.thumbnail_url || item.media_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail_url ?? item.media_url ?? ''}
                    alt={item.caption ?? item.id}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">No preview</div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                    {item.media_type ?? 'MEDIA'}
                  </span>
                  <span className="text-[11px] text-gray-400">{item.timestamp?.slice(0, 10) ?? '-'}</span>
                </div>
                <p className="line-clamp-3 text-sm text-gray-700">{item.caption ?? 'No caption'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Likes {item.like_count ?? 0}</span>
                  <span>Comments {item.comments_count ?? 0}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
