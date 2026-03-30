import { createClient } from '@supabase/supabase-js'

/**
 * 서버 컴포넌트 전용 Supabase 클라이언트.
 * 브라우저 API 없이 직접 supabase-js를 사용합니다.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
