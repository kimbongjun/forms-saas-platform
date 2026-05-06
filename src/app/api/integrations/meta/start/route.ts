import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { buildMetaOAuthUrl, getMetaStateCookieName } from '@/lib/meta-instagram'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = await getUserRole(user.id)
  if (role !== 'administrator') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const state = crypto.randomUUID()
  const origin = new URL(req.url).origin
  const redirectUrl = buildMetaOAuthUrl(origin, state)
  const response = NextResponse.redirect(redirectUrl)

  response.cookies.set(getMetaStateCookieName(), state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
