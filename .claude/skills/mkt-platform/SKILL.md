---
name: mkt-platform
description: 마케팅 프로젝트 관리 플랫폼 개발 컨텍스트 로더 .claudeprompts/ 문서를 읽어 DB 스키마·IA·기능 목록을 파악하고, Next.js 16 + Supabase + TinyMCE 핵심 패턴을 강제 적용한다.
---

# 마케팅 프로젝트 관리 플랫폼 — 개발 컨텍스트 로더

## Step 1: 프로젝트 문서 로드

다음 파일들을 순서대로 읽어 전체 컨텍스트를 파악한다.

```
.claudeprompts/00-PROJECT-MAIN.md    ← 폴더구조·스택·데이터흐름
.claudeprompts/01-SUPABASE-SCHEMA.md ← DB 스키마·RLS·마이그레이션
.claudeprompts/02-FORM-BUILDER-UI.md ← 빌더 컴포넌트·UI 패턴
.claudeprompts/03-FEATURES.md        ← 구현 기능·API 라우트 전체
.claudeprompts/04-SUBMISSION-PLAN.md ← 폼 제출·응답 관리
.claudeprompts/05-IA-NAVIGATION.md   ← 사이트맵·권한·레이아웃
```

필요한 파일만 선택적으로 읽는다. 관련 없는 파일은 건너뛴다.

## Step 2: 현재 작업 파악

사용자의 요청에서 다음을 확인한다:
- 어떤 페이지/컴포넌트/API를 수정하는가?
- Server Component인가 Client Component인가?
- 새 DB 테이블이 필요한가?
- 인증이 필요한 경로인가?

## Step 3: 핵심 패턴 강제 적용

코드 작성 전 반드시 아래 규칙을 체크한다.

### Next.js 16 App Router
```typescript
// params는 반드시 Promise로 await
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### Supabase 클라이언트 선택
```typescript
// Server Component / Route Handler / Server Action
import { createServerClient } from '@/utils/supabase/server'
const supabase = await createServerClient()

// Client Component ('use client')
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// 공개 폼 (비인증, 캐시 no-store)
import { createPublicClient } from '@/utils/supabase/public'
const supabase = createPublicClient()

// 관리자 전용 (service_role — 절대 클라이언트 노출 금지)
import { createAdminClient } from '@/utils/supabase/admin'
const supabase = createAdminClient()
```

### API 라우트 인증 패턴
```typescript
const supabase = await createServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 관리자 전용이면 추가 검증
const role = await getUserRole(user.id)
if (role !== 'administrator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

### TinyMCE (RichTextEditor)
```typescript
// SSR 비활성화 필수
const RichTextEditor = dynamic(() => import('@/components/builder/RichTextEditor'), {
  ssr: false,
  loading: () => <div>로딩 중...</div>
})
```

### 타입 정의 위치
- 모든 DB 관련 타입: `src/types/database.ts`
- 프로젝트 작업 타입: `src/types/project-task.ts`

### 새 DB 테이블 RLS 패턴
```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_new_table ON new_table TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
```

## Step 4: 작업 진행

컨텍스트 로드 및 패턴 확인 후, 사용자가 요청한 작업을 즉시 진행한다.
별도의 확인 없이 읽은 문서를 바탕으로 기존 코드 스타일과 일관성을 유지하며 구현한다.

## 주요 참조 경로

| 목적 | 경로 |
|---|---|
| 색상/테마 유틸 | `src/utils/site-settings.ts` |
| 스토어 (폼 빌더) | `src/stores/form-builder-store.ts` |
| URL 파싱 (클리핑) | `src/features/clippings/parser.ts` |
| 소셜 파싱 (결과물) | `src/features/deliverables/parser.ts` |
| Storage 업로드 | `src/utils/supabase/storage.ts` |
| IA 상수 | `src/constants/ia.ts` |
| 브랜딩 상수 | `src/constants/branding.ts` |
