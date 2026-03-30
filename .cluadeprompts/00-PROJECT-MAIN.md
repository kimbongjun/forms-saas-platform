# 프로젝트: Form & Banner SaaS 플랫폼

## 🛠 핵심 스택
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Lucide React
- **Backend**: Supabase (Auth, DB, Storage)

## 📁 폴더 구조 규칙
- `app/`: Next.js App Router (페이지 및 레이아웃)
- `components/`: 재사용 가능한 UI 컴포넌트
- `utils/supabase/`: Supabase 클라이언트 및 서버 설정
- `types/`: 전역 타입 정의 (`types/form.ts` 등)

## 🚀 개발 원칙
1. **Type Safety**: 모든 데이터와 API 응답은 명확한 Interface를 가져야 함.
2. **Client/Server 분리**: `'use client'` 지시어를 적절히 사용하여 컴포넌트 최적화.
3. **Clean Code**: 함수는 하나의 기능만 담당하며, Tailwind 클래스는 가독성을 고려함.