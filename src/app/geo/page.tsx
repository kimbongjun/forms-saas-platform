import type { Metadata } from 'next'
import { createServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GeoClient from './_components/GeoClient'

export const metadata: Metadata = {
  title: 'GEO/AEO | AI 검색 최적화 인텔리전스',
  description: '경쟁 브랜드 GEO/AEO 최적화 상태 추적 및 AI 답변 노출 분석',
}

export default async function GeoPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <GeoClient />
}
