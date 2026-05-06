import { NextResponse } from 'next/server'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

export async function POST() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id)
  if (role !== 'administrator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('social_integrations')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'meta_instagram')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
