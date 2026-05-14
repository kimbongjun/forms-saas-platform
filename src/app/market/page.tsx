import type { Metadata } from 'next'
import { createServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MarketClient from './_components/MarketClient'

export const metadata: Metadata = {
  title: '시장조사 | Market Intelligence',
  description: '경쟁사 인텔리전스 대시보드',
}

export default async function MarketPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <MarketClient />
}
