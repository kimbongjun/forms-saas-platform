import { NextRequest, NextResponse } from 'next/server'
import {
  fetchInstagramBusinessProfile,
  fetchInstagramHashtagDemo,
  fetchInstagramRecentMedia,
  fetchMetaPages,
  fetchMetaPermissions,
} from '@/lib/meta-instagram'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id)
  if (role !== 'administrator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: connection, error } = await supabase
    .from('social_integrations')
    .select('facebook_page_id,instagram_business_account_id,access_token,instagram_username,facebook_page_name,scopes')
    .eq('user_id', user.id)
    .eq('provider', 'meta_instagram')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!connection?.access_token || !connection.instagram_business_account_id) {
    return NextResponse.json({ error: 'No Meta Instagram connection found' }, { status: 404 })
  }

  try {
    const hashtag = new URL(req.url).searchParams.get('hashtag') ?? 'classys'

    const [permissions, pages, profile, recentMedia, hashtagMedia] = await Promise.all([
      fetchMetaPermissions(connection.access_token),
      fetchMetaPages(connection.access_token),
      fetchInstagramBusinessProfile(connection.access_token, connection.instagram_business_account_id),
      fetchInstagramRecentMedia(connection.access_token, connection.instagram_business_account_id),
      fetchInstagramHashtagDemo(connection.access_token, connection.instagram_business_account_id, hashtag),
    ])

    await supabase
      .from('social_integrations')
      .update({
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('provider', 'meta_instagram')

    return NextResponse.json({
      hashtag,
      permissions,
      pageCount: pages.length,
      profile,
      recentMedia,
      hashtagMedia,
    })
  } catch (demoError) {
    return NextResponse.json(
      { error: demoError instanceof Error ? demoError.message : 'Meta demo fetch failed' },
      { status: 500 }
    )
  }
}
