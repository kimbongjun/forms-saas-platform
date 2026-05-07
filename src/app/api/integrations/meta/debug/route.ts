import { NextRequest, NextResponse } from 'next/server'
import {
  buildMetaRedirectUri,
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchMetaMe,
  fetchMetaPages,
  fetchMetaPermissions,
  resolveMetaAppOrigin,
} from '@/lib/meta-instagram'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

/**
 * Debug endpoint — returns raw Meta API responses without writing to DB.
 * Two modes:
 *   GET /api/integrations/meta/debug           → show current stored connection's raw pages
 *   GET /api/integrations/meta/debug?code=...  → exchange an OAuth code and show raw pages
 *
 * Admin-only. Never exposes full access tokens.
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id)
  if (role !== 'administrator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const origin = resolveMetaAppOrigin({
    requestUrl: req.url,
    forwardedHost: req.headers.get('x-forwarded-host'),
    forwardedProto: req.headers.get('x-forwarded-proto'),
    host: req.headers.get('host'),
  })

  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  try {
    let accessToken: string

    if (code) {
      // Exchange fresh code — useful right after OAuth redirect to inspect raw response
      const redirectUri = buildMetaRedirectUri(origin)
      const shortToken = await exchangeCodeForShortLivedToken(code, redirectUri)
      const longToken = await exchangeForLongLivedToken(shortToken.access_token)
      accessToken = longToken.access_token
    } else {
      // Use existing stored token
      const { data: connection } = await supabase
        .from('social_integrations')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('provider', 'meta_instagram')
        .maybeSingle()

      if (!connection?.access_token) {
        return NextResponse.json(
          { error: 'No stored connection. Pass ?code=... from an OAuth callback to inspect a fresh token.' },
          { status: 404 }
        )
      }
      accessToken = connection.access_token
    }

    const [me, permissions, pages] = await Promise.all([
      fetchMetaMe(accessToken),
      fetchMetaPermissions(accessToken),
      fetchMetaPages(accessToken),
    ])

    // Sanitize: remove actual access tokens from page objects before returning
    const sanitizedPages = pages.map((page) => ({
      id: page.id,
      name: page.name,
      has_page_access_token: Boolean(page.access_token),
      instagram_business_account: page.instagram_business_account ?? null,
    }))

    return NextResponse.json({
      me,
      permissions,
      pages: sanitizedPages,
      diagnosis: {
        page_count: pages.length,
        pages_with_instagram: sanitizedPages.filter((p) => p.instagram_business_account?.id).length,
        granted_scopes: permissions.filter((p) => p.status === 'granted').map((p) => p.permission),
        missing_instagram_business_account:
          sanitizedPages.every((p) => !p.instagram_business_account?.id),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Debug fetch failed' },
      { status: 500 }
    )
  }
}
