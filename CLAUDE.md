# 마케팅 프로젝트 관리 플랫폼 — Claude 컨텍스트

## 스택
- Next.js 16 App Router · TypeScript · Tailwind CSS v4 · Supabase · Resend · @dnd-kit · Tiptap v2 · Zustand

## 핵심 규칙
- `params`는 반드시 `await` (`params: Promise<{id:string}>`)
- Server Component → `createServerClient()` / Client Component → `createClient()` / 공개 폼(비인증) → `createPublicClient()`
- Tiptap: `dynamic(...,{ssr:false})` + `immediatelyRender: false` 필수
- 타입 정의 위치: `src/types/database.ts`

## 상세 문서 (필요 시 참조)
| 파일 | 내용 |
|---|---|
| `.claudeprompts/00-PROJECT-MAIN.md` | 폴더 구조 · 컴포넌트 역할 · 데이터 흐름 |
| `.claudeprompts/01-SUPABASE-SCHEMA.md` | DB 스키마 · RLS 정책 · Storage · 환경변수 |
| `.claudeprompts/02-FORM-BUILDER-UI.md` | 빌더 컴포넌트 구조 · 필드 타입별 UI |
| `.claudeprompts/03-FEATURES.md` | 구현 완료 기능 · 필드 타입 목록 · API 라우트 |
| `.claudeprompts/04-SUBMISSION-PLAN.md` | 폼 제출 · CSV export · 응답 통계 |
| `.claudeprompts/05-IA-NAVIGATION.md` | 사이트맵 · 역할별 권한 · 레이아웃 구조 · 플로우 |
