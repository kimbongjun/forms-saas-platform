import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { APP_TITLE } from '@/constants/branding'
import { createServerClient } from '@/utils/supabase/server'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_TITLE,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let primaryColor = '#111827'
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('site_settings')
      .select('settings')
      .eq('id', 1)
      .single()
    if (data?.settings?.primary_color) primaryColor = data.settings.primary_color
  } catch {
    // site_settings 미설정 시 기본값 사용
  }

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ '--color-primary': primaryColor } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  )
}
