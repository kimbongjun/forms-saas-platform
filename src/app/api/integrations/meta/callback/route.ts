import { NextRequest, NextResponse } from 'next/server'
import {
  buildMetaRedirectUri,
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchMetaMe,
  fetchMetaPages,
  fetchMetaPermissions,
  findPageWithInstagramAccount,
  getMetaStateCookieName,
  resolveMetaAppOrigin,
} from '@/lib/meta-instagram'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

function redirectToConsole(origin: string, params: Record<string, string>) {
  const url = new URL('/dashboard/admin/meta-instagram-review', origin)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const origin = resolveMetaAppOrigin({
    requestUrl: req.url,
    forwardedHost: req.headers.get('x-forwarded-host'),
    forwardedProto: req.headers.get('x-forwarded-proto'),
    host: req.headers.get('host'),
  })

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', origin))

  const role = await getUserRole(user.id)
  if (role !== 'administrator') return NextResponse.redirect(new URL('/dashboard', origin))

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const cookieState = req.cookies.get(getMetaStateCookieName())?.value

  if (error) {
    return redirectToConsole(origin, { error })
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return redirectToConsole(origin, { error: 'invalid_oauth_state' })
  }

  try {
    const redirectUri = buildMetaRedirectUri(origin)
    const shortToken = await exchangeCodeForShortLivedToken(code, redirectUri)
    const longToken = await exchangeForLongLivedToken(shortToken.access_token)
    const accessToken = longToken.access_token

    const [me, permissions, pages] = await Promise.all([
      fetchMetaMe(accessToken),
      fetchMetaPermissions(accessToken),
      fetchMetaPages(accessToken),
    ])

    const connectedPage = findPageWithInstagramAccount(pages)
    if (!connectedPage?.instagram_business_account?.id) {
      const grantedForDiag = permissions
        .filter((p) => p.status === 'granted')
        .map((p) => p.permission)
        .join(',')
      const pageNames = pages.map((p) => p.name).join('|')
      const hasIgField = pages.some(
        (p) => 'instagram_business_account' in p && p.instagram_business_account !== undefined
      )
      return redirectToConsole(origin, {
        error: 'missing_instagram_business_account',
        diag_page_count: String(pages.length),
        diag_pages: pageNames || '(none)',
        diag_ig_field_present: String(hasIgField),
        diag_scopes: grantedForDiag || '(none)',
      })
    }

    const grantedScopes = permissions
      .filter((permission) => permission.status === 'granted')
      .map((permission) => permission.permission)

    // Store page access token separately — Instagram Business API endpoints
    // (/{ig-user-id}, /{ig-user-id}/media, /ig_hashtag_search) require the
    // Page Access Token, not the User Access Token.
    const pageAccessToken = connectedPage.access_token ?? accessToken

    const { error: upsertError } = await supabase.from('social_integrations').upsert(
      {
        user_id: user.id,
        provider: 'meta_instagram',
        status: 'connected',
        facebook_user_id: me.id,
        facebook_page_id: connectedPage.id,
        facebook_page_name: connectedPage.name,
        instagram_business_account_id: connectedPage.instagram_business_account.id,
        instagram_username: connectedPage.instagram_business_account.username ?? null,
        access_token: pageAccessToken,
        token_expires_at: longToken.expires_in
          ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
          : null,
        scopes: grantedScopes,
        metadata: {
          page_count: pages.length,
          user_access_token_expires_in: longToken.expires_in ?? null,
        },
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    )

    if (upsertError) {
      return redirectToConsole(origin, { error: `integration_save_failed:${upsertError.message}` })
    }

    const response = redirectToConsole(origin, { connected: '1' })
    response.cookies.delete(getMetaStateCookieName())
    return response
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : 'unknown_error'
    const response = redirectToConsole(origin, { error: message })
    response.cookies.delete(getMetaStateCookieName())
    return response
  }
}
