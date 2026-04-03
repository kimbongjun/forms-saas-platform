import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { APP_TITLE } from '@/constants/branding'

export interface GlobalSiteSettings {
  site_title?: string
  site_description?: string
  favicon_url?: string
  og_image_url?: string
  primary_color?: string
  footer_text?: string
  privacy_policy?: string
  terms_of_service?: string
  service_agreement?: string
}

const getCachedGlobalSiteSettings = unstable_cache(
  async (): Promise<GlobalSiteSettings> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) return {}

    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data } = await supabase
      .from('site_settings')
      .select('settings')
      .eq('id', 1)
      .single()

    return (data?.settings as GlobalSiteSettings | null) ?? {}
  },
  ['global-site-settings'],
  { revalidate: 300, tags: ['site-settings'] }
)

export async function getGlobalSiteSettings() {
  try {
    return await getCachedGlobalSiteSettings()
  } catch {
    return {}
  }
}

export function getResolvedSiteTitle(settings: GlobalSiteSettings) {
  return settings.site_title?.trim() || APP_TITLE
}

export function getResolvedSiteDescription(settings: GlobalSiteSettings) {
  return settings.site_description?.trim() || APP_TITLE
}

export function getResolvedPrimaryColor(settings: GlobalSiteSettings) {
  return settings.primary_color?.trim() || '#111827'
}

export function getResolvedFavicon(settings: GlobalSiteSettings) {
  const faviconUrl = settings.favicon_url?.trim()
  if (!faviconUrl) return null

  const lowerUrl = faviconUrl.toLowerCase()
  const type = lowerUrl.endsWith('.svg')
    ? 'image/svg+xml'
    : lowerUrl.endsWith('.png')
      ? 'image/png'
      : lowerUrl.endsWith('.ico')
        ? 'image/x-icon'
        : undefined

  return {
    url: faviconUrl,
    type,
    sizes: type === 'image/svg+xml' ? 'any' : undefined,
  }
}
