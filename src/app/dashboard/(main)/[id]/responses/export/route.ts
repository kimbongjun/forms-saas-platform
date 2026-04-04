import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params
  const url = new URL(request.url)
  url.pathname = `/projects/${id}/execution/forms`
  url.search = ''
  return NextResponse.redirect(url)
}
