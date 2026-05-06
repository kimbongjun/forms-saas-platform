const META_GRAPH_VERSION = 'v23.0'
const META_STATE_COOKIE = 'meta_instagram_oauth_state'

type MetaPermission = {
  permission: string
  status: string
}

type MetaPage = {
  id: string
  name: string
  access_token?: string
  instagram_business_account?: {
    id: string
    username?: string
  } | null
}

type InstagramProfile = {
  id: string
  username?: string
  name?: string
  profile_picture_url?: string
  biography?: string
  website?: string
  followers_count?: number
  media_count?: number
}

type InstagramMedia = {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp?: string
  like_count?: number
  comments_count?: number
}

function getMetaEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/+$/, '')
}

export function getMetaAppCredentials() {
  return {
    appId: getMetaEnv('FACEBOOK_APP_ID'),
    appSecret: getMetaEnv('FACEBOOK_APP_SECRET'),
  }
}

export function getMetaRequiredScopes() {
  return ['pages_show_list', 'pages_read_engagement', 'instagram_basic']
}

export function getMetaStateCookieName() {
  return META_STATE_COOKIE
}

export function resolveMetaAppOrigin(input?: {
  requestUrl?: string
  forwardedHost?: string | null
  forwardedProto?: string | null
  host?: string | null
}) {
  const configured =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    return normalizeOrigin(configured)
  }

  const forwardedHost = input?.forwardedHost?.trim()
  if (forwardedHost) {
    const proto = input?.forwardedProto?.trim() || 'https'
    return normalizeOrigin(`${proto}://${forwardedHost}`)
  }

  const host = input?.host?.trim()
  if (host) {
    const proto = input?.forwardedProto?.trim() || 'https'
    return normalizeOrigin(`${proto}://${host}`)
  }

  if (input?.requestUrl) {
    return normalizeOrigin(new URL(input.requestUrl).origin)
  }

  throw new Error('Unable to resolve Meta app origin')
}

export function buildMetaRedirectUri(origin: string) {
  return `${normalizeOrigin(origin)}/api/integrations/meta/callback`
}

export function buildMetaOAuthUrl(origin: string, state: string) {
  const { appId } = getMetaAppCredentials()
  const url = new URL(`https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', buildMetaRedirectUri(origin))
  url.searchParams.set('state', state)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', getMetaRequiredScopes().join(','))
  return url.toString()
}

async function fetchMetaJson<T>(
  path: string,
  params: Record<string, string | undefined> = {},
  accessToken?: string
): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })

  if (accessToken) url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  const json = await res.json()

  if (!res.ok || json?.error) {
    throw new Error(json?.error?.message ?? `Meta Graph API request failed: ${res.status}`)
  }

  return json as T
}

export async function exchangeCodeForShortLivedToken(code: string, redirectUri: string) {
  const { appId, appSecret } = getMetaAppCredentials()

  return fetchMetaJson<{
    access_token: string
    token_type?: string
  }>('/oauth/access_token', {
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })
}

export async function exchangeForLongLivedToken(accessToken: string) {
  const { appId, appSecret } = getMetaAppCredentials()

  return fetchMetaJson<{
    access_token: string
    token_type?: string
    expires_in?: number
  }>('/oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: accessToken,
  })
}

export async function fetchMetaPermissions(accessToken: string) {
  const response = await fetchMetaJson<{ data?: MetaPermission[] }>('/me/permissions', {}, accessToken)
  return response.data ?? []
}

export async function fetchMetaMe(accessToken: string) {
  return fetchMetaJson<{ id: string; name?: string }>('/me', { fields: 'id,name' }, accessToken)
}

export async function fetchMetaPages(accessToken: string) {
  const response = await fetchMetaJson<{ data?: MetaPage[] }>(
    '/me/accounts',
    {
      fields: 'id,name,access_token,instagram_business_account{id,username}',
      limit: '100',
    },
    accessToken
  )

  return response.data ?? []
}

export function findPageWithInstagramAccount(pages: MetaPage[]) {
  return pages.find((page) => page.instagram_business_account?.id)
}

export async function fetchInstagramBusinessProfile(accessToken: string, igUserId: string) {
  return fetchMetaJson<InstagramProfile>(
    `/${igUserId}`,
    {
      fields: 'id,username,name,profile_picture_url,biography,website,followers_count,media_count',
    },
    accessToken
  )
}

export async function fetchInstagramRecentMedia(accessToken: string, igUserId: string) {
  const response = await fetchMetaJson<{ data?: InstagramMedia[] }>(
    `/${igUserId}/media`,
    {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit: '6',
    },
    accessToken
  )

  return response.data ?? []
}

export async function fetchInstagramHashtagDemo(accessToken: string, igUserId: string, hashtag: string) {
  const normalized = hashtag.replace(/^#+/, '').trim()
  if (!normalized) return []

  const hashtagSearch = await fetchMetaJson<{ data?: Array<{ id: string }> }>(
    '/ig_hashtag_search',
    {
      user_id: igUserId,
      q: normalized,
    },
    accessToken
  )

  const hashtagId = hashtagSearch.data?.[0]?.id
  if (!hashtagId) return []

  const recentMedia = await fetchMetaJson<{ data?: InstagramMedia[] }>(
    `/${hashtagId}/recent_media`,
    {
      user_id: igUserId,
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit: '6',
    },
    accessToken
  )

  return recentMedia.data ?? []
}
