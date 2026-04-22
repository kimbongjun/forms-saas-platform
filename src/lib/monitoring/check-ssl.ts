import tls from 'tls'

export interface SslResult {
  days_remaining: number | null
  valid_until: string | null
  valid_from: string | null
  issued_by: string | null
  subject_cn: string | null
  error: string | null
}

const CACHE = new Map<string, { result: SslResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1h

export async function checkSsl(url: string, fresh = false): Promise<SslResult> {
  if (!url.startsWith('https://')) {
    return { days_remaining: null, valid_until: null, valid_from: null, issued_by: null, subject_cn: null, error: 'HTTPS 미사용' }
  }

  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return { days_remaining: null, valid_until: null, valid_from: null, issued_by: null, subject_cn: null, error: '잘못된 URL' }
  }

  if (!fresh) {
    const cached = CACHE.get(hostname)
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result
  }

  const result = await new Promise<SslResult>((resolve) => {
    let settled = false

    const done = (r: SslResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { socket.destroy() } catch {}
      resolve(r)
    }

    const timer = setTimeout(() => {
      done({ days_remaining: null, valid_until: null, valid_from: null, issued_by: null, subject_cn: null, error: '연결 시간 초과' })
    }, 8000)

    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
      () => {
        try {
          const cert = socket.getPeerCertificate()

          if (!cert || !cert.valid_to) {
            done({ days_remaining: null, valid_until: null, valid_from: null, issued_by: null, subject_cn: null, error: '인증서 없음' })
            return
          }

          const validUntil = new Date(cert.valid_to)
          const validFrom = cert.valid_from ? new Date(cert.valid_from) : null
          const now = new Date()
          const days_remaining = Math.floor((validUntil.getTime() - now.getTime()) / 86_400_000)

          const raw = cert as unknown as Record<string, unknown>
          const issuerObj = raw.issuer as Record<string, string | string[]> | undefined
          const subjectObj = raw.subject as Record<string, string | string[]> | undefined

          const pick = (obj: Record<string, string | string[]> | undefined, key: string): string | null => {
            if (!obj) return null
            const v = obj[key]
            return Array.isArray(v) ? v[0] ?? null : v ?? null
          }

          done({
            days_remaining,
            valid_until: validUntil.toISOString(),
            valid_from: validFrom?.toISOString() ?? null,
            issued_by: pick(issuerObj, 'O') ?? pick(issuerObj, 'CN'),
            subject_cn: pick(subjectObj, 'CN'),
            error: null,
          })
        } catch (e) {
          done({ days_remaining: null, valid_until: null, valid_from: null, issued_by: null, subject_cn: null, error: String(e).slice(0, 100) })
        }
      },
    )

    socket.on('error', (err) => {
      done({ days_remaining: null, valid_until: null, valid_from: null, issued_by: null, subject_cn: null, error: err.message.slice(0, 100) })
    })
  })

  CACHE.set(hostname, { result, ts: Date.now() })
  return result
}
