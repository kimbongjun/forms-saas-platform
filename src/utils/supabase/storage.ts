// 01-SUPABASE-SCHEMA.md: uploadBanner 유틸리티
// Bucket: banners / Path: project-banners/{uuid}.{ext}

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 이미지 파일을 Supabase Storage의 banners 버킷에 업로드하고
 * Public URL을 반환합니다.
 */
export async function uploadBanner(
  supabase: SupabaseClient,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const uuid = crypto.randomUUID()
  const path = `project-banners/${uuid}.${ext}`

  const { error } = await supabase.storage
    .from('banners')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('[uploadBanner] Storage error:', error)
    throw new Error(`배너 업로드 실패: ${error.message}`)
  }

  const { data } = supabase.storage.from('banners').getPublicUrl(path)
  return data.publicUrl
}
