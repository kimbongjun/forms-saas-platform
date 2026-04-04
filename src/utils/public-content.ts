import { createPublicClient } from '@/utils/supabase/public'

export async function getPublishedAnnouncements() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('announcements')
    .select('id, title, created_at, is_pinned')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getPublishedAnnouncementById(id: string) {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()
  return data ?? null
}

export async function getReleaseNotes() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('release_notes')
    .select('id, version, title, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getReleaseNoteById(id: string) {
  const supabase = createPublicClient()
  const { data } = await supabase.from('release_notes').select('*').eq('id', id).single()
  return data ?? null
}

export async function getPublicProjectBySlug(slug: string) {
  const supabase = createPublicClient()
  const { data } = await supabase.from('projects').select('*').eq('slug', slug).single()
  return data ?? null
}

export async function getPublicFormFields(projectId: string) {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('form_fields')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
  return data ?? []
}
