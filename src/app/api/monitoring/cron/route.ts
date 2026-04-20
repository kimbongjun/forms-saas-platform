import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/utils/supabase/admin'
import { checkUrl } from '@/lib/monitoring/check-url'
import type { MonitorStatus } from '@/types/database'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

// ── 인증 ─────────────────────────────────────────────────────────
// GitHub Actions가 호출 시 Authorization: Bearer {CRON_SECRET} 헤더 전달
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

// ── 다운 알림 이메일 ─────────────────────────────────────────────
async function sendDownAlert(opts: {
  to: string
  siteName: string
  siteUrl: string
  status: MonitorStatus
  statusCode: number | null
  errorMessage: string | null
  checkedAt: string
}) {
  const { to, siteName, siteUrl, status, statusCode, errorMessage, checkedAt } = opts
  const statusLabel = status === 'down' ? '오프라인' : status === 'slow' ? '응답 지연' : '오류'
  const color = status === 'slow' ? '#d97706' : '#dc2626'

  await getResend().emails.send({
    from: 'Monitor Alert <noreply@blueberry.marketing>',
    to,
    subject: `[모니터링 경보] ${siteName} — ${statusLabel} 감지`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#111;padding:20px 24px;border-radius:12px 12px 0 0">
          <p style="margin:0;color:#fff;font-size:16px;font-weight:700">웹 모니터링 경보</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
          <div style="display:inline-block;background:${color}15;color:${color};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:16px">
            ⚠ ${statusLabel}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:100px">사이트</td>
              <td style="padding:8px 0;font-weight:600;color:#111">${siteName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280">URL</td>
              <td style="padding:8px 0"><a href="${siteUrl}" style="color:#2563eb">${siteUrl}</a></td>
            </tr>
            ${statusCode ? `<tr><td style="padding:8px 0;color:#6b7280">HTTP 코드</td><td style="padding:8px 0;font-family:monospace">${statusCode}</td></tr>` : ''}
            ${errorMessage ? `<tr><td style="padding:8px 0;color:#6b7280">오류 내용</td><td style="padding:8px 0;color:#dc2626">${errorMessage}</td></tr>` : ''}
            <tr>
              <td style="padding:8px 0;color:#6b7280">감지 시각</td>
              <td style="padding:8px 0">${new Date(checkedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
            </tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#9ca3af">
            이 알림은 <strong>${siteName}</strong>의 모니터링 설정에 따라 자동 발송되었습니다.
          </p>
        </div>
      </div>`,
  })
}

// ── 회복 알림 이메일 ─────────────────────────────────────────────
async function sendRecoveryAlert(opts: {
  to: string
  siteName: string
  siteUrl: string
  checkedAt: string
}) {
  const { to, siteName, siteUrl, checkedAt } = opts
  await getResend().emails.send({
    from: 'Monitor Alert <noreply@blueberry.marketing>',
    to,
    subject: `[모니터링] ${siteName} — 정상 회복`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#111;padding:20px 24px;border-radius:12px 12px 0 0">
          <p style="margin:0;color:#fff;font-size:16px;font-weight:700">웹 모니터링 — 정상 회복</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
          <div style="display:inline-block;background:#d1fae5;color:#059669;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:16px">
            ✓ 정상 회복
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:100px">사이트</td>
              <td style="padding:8px 0;font-weight:600;color:#111">${siteName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280">URL</td>
              <td style="padding:8px 0"><a href="${siteUrl}" style="color:#2563eb">${siteUrl}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280">회복 시각</td>
              <td style="padding:8px 0">${new Date(checkedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
            </tr>
          </table>
        </div>
      </div>`,
  })
}

// ── 개별 사이트 체크 + DB 저장 + 알림 ────────────────────────────
async function processSite(site: {
  id: string
  url: string
  name: string
  notify_email: string | null
  last_status: string | null
}) {
  const supabase = createAdminClient()
  const result = await checkUrl(site.url)
  const now = new Date().toISOString()

  await supabase
    .from('monitor_sites')
    .update({
      last_checked_at: now,
      last_status: result.status,
      last_response_time: result.response_time,
      last_ttfb: result.ttfb,
      last_status_code: result.status_code,
      last_error: result.error_message,
      updated_at: now,
    })
    .eq('id', site.id)

  await supabase.from('monitor_checks').insert({
    site_id: site.id,
    checked_at: now,
    status: result.status,
    response_time: result.response_time,
    ttfb: result.ttfb,
    status_code: result.status_code,
    error_message: result.error_message,
  })

  // 최근 5개만 유지 — 초과분 삭제
  const { data: allChecks } = await supabase
    .from('monitor_checks')
    .select('id')
    .eq('site_id', site.id)
    .order('checked_at', { ascending: false })

  if (allChecks && allChecks.length > 5) {
    const deleteIds = allChecks.slice(5).map((c) => c.id)
    await supabase.from('monitor_checks').delete().in('id', deleteIds)
  }

  // 상태 변화 감지 시 이메일 알림
  if (site.notify_email) {
    const prev = site.last_status as MonitorStatus | null
    const cur = result.status
    const wasOk = !prev || prev === 'up' || prev === 'unknown'
    const isDown = cur === 'down' || cur === 'error' || cur === 'slow'
    const isUp = cur === 'up'

    if (wasOk && isDown) {
      await sendDownAlert({
        to: site.notify_email,
        siteName: site.name,
        siteUrl: site.url,
        status: cur,
        statusCode: result.status_code,
        errorMessage: result.error_message,
        checkedAt: now,
      }).catch(err => console.error('[Monitor/Cron] 알림 이메일 실패:', err))
    }

    if (!wasOk && isUp) {
      await sendRecoveryAlert({
        to: site.notify_email,
        siteName: site.name,
        siteUrl: site.url,
        checkedAt: now,
      }).catch(err => console.error('[Monitor/Cron] 회복 이메일 실패:', err))
    }
  }

  return { id: site.id, status: result.status }
}

// ── GET: GitHub Actions cron 엔드포인트 ─────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: sites, error } = await supabase
    .from('monitor_sites')
    .select('id, url, name, notify_email, last_status')
    .eq('is_active', true)

  if (error) {
    console.error('[Monitor/Cron] DB 조회 실패:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ checked: 0, message: '활성 사이트 없음' })
  }

  // 최대 10개 병렬 처리
  const CONCURRENCY = 10
  const results: { id: string; status: string }[] = []

  for (let i = 0; i < sites.length; i += CONCURRENCY) {
    const batch = sites.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.allSettled(batch.map(s => processSite(s)))
    batchResults.forEach(r => {
      if (r.status === 'fulfilled') results.push(r.value)
    })
  }

  console.log(`[Monitor/Cron] ${results.length}/${sites.length} 사이트 체크 완료`)
  return NextResponse.json({ checked: results.length, results })
}
