import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

/**
 * 서버 컴포넌트 / Route Handler 전용 Supabase 클라이언트.
 * 쿠키 기반 세션을 자동으로 읽고 씁니다.
 */
export async function createServerClient() {
  const cookieStore = await cookies()
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출된 경우 set은 무시됨 (middleware가 처리)
          }
        },
      },
    }
  )
}

/**
 * 현재 로그인한 사용자의 role을 반환합니다.
 * profiles 테이블에 없으면 기본값 'editor' 반환.
 */
export async function getUserRole(userId: string): Promise<'administrator' | 'editor'> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[getUserRole] profiles 조회 실패:', error)

    // RLS 또는 세션 이슈가 있어도 서버에서는 service role로 최종 확인할 수 있게 둡니다.
    try {
      const admin = createAdminClient()
      const { data: adminData, error: adminError } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (adminError) {
        console.error('[getUserRole] admin fallback 조회 실패:', adminError)
      } else if (adminData?.role) {
        return adminData.role as 'administrator' | 'editor'
      }
    } catch (adminClientError) {
      console.error('[getUserRole] admin client 생성 실패:', adminClientError)
    }

    return 'editor'
  }

  return (data?.role as 'administrator' | 'editor') ?? 'editor'
}
