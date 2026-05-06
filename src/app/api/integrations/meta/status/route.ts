import { NextResponse } from 'next/server'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id)
  if (role !== 'administrator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('social_integrations')
    .select(
      'provider,status,facebook_user_id,facebook_page_id,facebook_page_name,instagram_business_account_id,instagram_username,scopes,token_expires_at,last_validated_at,created_at,updated_at'
    )
    .eq('user_id', user.id)
    .eq('provider', 'meta_instagram')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    envConfigured: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    connection: data,
  })
}
