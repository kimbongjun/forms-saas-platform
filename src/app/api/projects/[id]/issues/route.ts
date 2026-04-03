import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('project_issues')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('project_issues')
    .insert({ ...body, project_id: id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()
  const { issueId, ...body } = await req.json()

  const { data, error } = await supabase
    .from('project_issues')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', issueId)
    .eq('project_id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()
  const { issueId } = await req.json()

  const { error } = await supabase
    .from('project_issues')
    .delete()
    .eq('id', issueId)
    .eq('project_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
