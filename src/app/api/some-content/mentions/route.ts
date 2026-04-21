import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import type { ScMentionSummary } from '@/types/database'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { searchParams } = req.nextUrl

  const today = new Date().toISOString().split('T')[0]
  const defaultFrom = new Date()
  defaultFrom.setDate(defaultFrom.getDate() - 7)
  const from = searchParams.get('from') ?? defaultFrom.toISOString().split('T')[0]
  const to = searchParams.get('to') ?? today

  const { data: keywords, error: kwErr } = await supabase
    .from('sc_keywords')
    .select('id, keyword')
    .eq('is_active', true)

  if (kwErr) return NextResponse.json({ error: kwErr.message }, { status: 500 })
  if (!keywords?.length) return NextResponse.json({ mentions: [], last_sync: null })

  const { data: rows, error: mErr } = await supabase
    .from('sc_mentions')
    .select('*')
    .in('keyword_id', keywords.map(k => k.id))
    .gte('mention_date', from)
    .lte('mention_date', to)

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

  const kwMap = new Map(keywords.map(k => [k.id, k.keyword]))
  const acc = new Map<string, { total: number; by_channel: Record<string, number>; last_synced: string | null }>()

  for (const k of keywords) acc.set(k.id, { total: 0, by_channel: {}, last_synced: null })

  for (const row of rows ?? []) {
    const entry = acc.get(row.keyword_id)
    if (!entry) continue
    const n = Number(row.count)
    entry.total += n
    entry.by_channel[row.channel] = (entry.by_channel[row.channel] ?? 0) + n
    if (!entry.last_synced || row.synced_at > entry.last_synced) entry.last_synced = row.synced_at
  }

  const mentions: ScMentionSummary[] = keywords.map(k => ({
    keyword_id: k.id,
    keyword: kwMap.get(k.id) ?? '',
    total: acc.get(k.id)?.total ?? 0,
    by_channel: acc.get(k.id)?.by_channel ?? {},
    last_synced: acc.get(k.id)?.last_synced ?? null,
  }))

  const last_sync = mentions.reduce<string | null>((max, m) => {
    if (!m.last_synced) return max
    if (!max || m.last_synced > max) return m.last_synced
    return max
  }, null)

  return NextResponse.json({ mentions, last_sync })
}
