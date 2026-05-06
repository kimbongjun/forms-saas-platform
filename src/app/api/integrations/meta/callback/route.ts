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
} from '@/lib/meta-instagram'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

function redirectToConsole(req: NextRequest, params: Record<string, string>) {
  const url = new URL('/dashboard/admin/meta-instagram-review', req.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const role = await getUserRole(user.id)
  if (role !== 'administrator') return NextResponse.redirect(new URL('/dashboard', req.url))

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const cookieState = req.cookies.get(getMetaStateCookieName())?.value

  if (error) {
    return redirectToConsole(req, { error })
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return redirectToConsole(req, { error: 'invalid_oauth_state' })
  }

  try {
    const redirectUri = buildMetaRedirectUri(url.origin)
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
      return redirectToConsole(req, { error: 'missing_instagram_business_account' })
    }

    const grantedScopes = permissions
      .filter((permission) => permission.status === 'granted')
      .map((permission) => permission.permission)

    await supabase.from('social_integrations').upsert(
      {
        user_id: user.id,
        provider: 'meta_instagram',
        status: 'connected',
        facebook_user_id: me.id,
        facebook_page_id: connectedPage.id,
        facebook_page_name: connectedPage.name,
        instagram_business_account_id: connectedPage.instagram_business_account.id,
        instagram_username: connectedPage.instagram_business_account.username ?? null,
        access_token: accessToken,
        token_expires_at: longToken.expires_in
          ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
          : null,
        scopes: grantedScopes,
        metadata: {
          page_count: pages.length,
        },
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    )

    const response = redirectToConsole(req, { connected: '1' })
    response.cookies.delete(getMetaStateCookieName())
    return response
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : 'unknown_error'
    const response = redirectToConsole(req, { error: message })
    response.cookies.delete(getMetaStateCookieName())
    return response
  }
}
