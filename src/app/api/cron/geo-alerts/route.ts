import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Resend } from 'resend'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

const ALERT_THRESHOLD = 5  // pts
const ALERT_TO        = 'bongjour@classys.com'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// Vercel Cron: GET /api/cron/geo-alerts — 매주 월요일 09:00 KST (00:00 UTC)
// 7일 전 대비 GEO 점수 변동이 ±5pts 이상인 브랜드를 이메일로 리포트
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase  = createAdminClient()
  const resend    = new Resend(process.env.RESEND_API_KEY)

  const refDate = new Date()
  refDate.setDate(refDate.getDate() - 7)
  const refDateStr = refDate.toISOString().split('T')[0]

  const { data: snapshots } = await supabase
    .from('geo_score_snapshots')
    .select('brand_id, geo_score')
    .eq('snapshot_date', refDateStr)

  if (!snapshots?.length) {
    return NextResponse.json({ ok: true, message: `7일 전(${refDateStr}) 스냅샷 없음 — 알림 건너뜀` })
  }

  const refMap = new Map(snapshots.map(s => [s.brand_id as string, s.geo_score as number]))

  type Alert = { brand: string; device: string; prev: number; curr: number; delta: number }
  const alerts: Alert[] = []

  for (const b of GEO_DATA) {
    const prev = refMap.get(b.id)
    if (prev === undefined) continue
    const delta = b.geo_score - prev
    if (Math.abs(delta) >= ALERT_THRESHOLD) {
      alerts.push({ brand: b.name, device: b.device_type, prev, curr: b.geo_score, delta })
    }
  }

  if (!alerts.length) {
    return NextResponse.json({ ok: true, message: `유의미한 변동 없음 (기준 ±${ALERT_THRESHOLD}pts)` })
  }

  alerts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

  const tableRows = alerts.map(a => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-weight:600;color:#1E293B">${a.brand}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;color:#64748B;font-size:13px">${a.device}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;text-align:center;color:#64748B">${a.prev}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;text-align:center;font-weight:700;color:#1E293B">${a.curr}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;text-align:center;font-weight:700;color:${a.delta > 0 ? '#059669' : '#DC2626'}">${a.delta > 0 ? '+' : ''}${a.delta}pts</td>
    </tr>`).join('')

  const now = new Date()
  const kstString = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short' })

  const html = `
<!DOCTYPE html>
<html lang="ko">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8FAFC;margin:0;padding:24px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0">
  <div style="background:#1E293B;padding:24px 32px">
    <p style="color:#94A3B8;font-size:12px;margin:0 0 4px">GEO/AEO 경쟁 인텔리전스</p>
    <h1 style="color:#F8FAFC;font-size:20px;margin:0">주간 GEO 점수 변동 리포트</h1>
  </div>
  <div style="padding:24px 32px">
    <p style="color:#475569;font-size:14px;margin:0 0 6px">기준일: <strong>${refDateStr}</strong> → 현재 비교</p>
    <p style="color:#475569;font-size:14px;margin:0 0 20px">기준치 <strong>±${ALERT_THRESHOLD}pts</strong> 이상 변동된 브랜드 <strong>${alerts.length}건</strong>입니다.</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden">
      <thead>
        <tr style="background:#F1F5F9">
          <th style="padding:10px 14px;text-align:left;font-size:13px;color:#64748B;font-weight:600">브랜드</th>
          <th style="padding:10px 14px;text-align:left;font-size:13px;color:#64748B;font-weight:600">기기 유형</th>
          <th style="padding:10px 14px;text-align:center;font-size:13px;color:#64748B;font-weight:600">7일 전</th>
          <th style="padding:10px 14px;text-align:center;font-size:13px;color:#64748B;font-weight:600">현재</th>
          <th style="padding:10px 14px;text-align:center;font-size:13px;color:#64748B;font-weight:600">변동</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <p style="margin-top:24px;color:#94A3B8;font-size:12px">발송 시각: ${kstString}</p>
  </div>
</div>
</body>
</html>`

  const { error: emailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to:      ALERT_TO,
    subject: `[GEO 주간 알림] 경쟁사 점수 변동 ${alerts.length}건 — ${now.toLocaleDateString('ko-KR')}`,
    html,
  })

  if (emailErr) {
    console.error('[cron/geo-alerts] email error:', emailErr)
    return NextResponse.json({ error: emailErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, alerts_sent: alerts.length, ref_date: refDateStr, alerts })
}
