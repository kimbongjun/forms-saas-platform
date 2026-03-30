# 단계별 실행 지휘서 (Implementation Plan)

## Step 1: 환경 구축
- [ ] `types/database.ts` 생성 및 필드 타입 정의.
- [ ] `utils/supabase/client.ts` 클라이언트 초기화 코드 작성.
- [ ] `utils/supabase/storage.ts` 내 `uploadBanner` 함수 구현.

## Step 2: 폼 빌더 핵심 컴포넌트 (`components/builder/`)
- [ ] `FormBuilder.tsx`: 필드 추가/삭제 상태 관리 로직.
- [ ] `BannerUpload.tsx`: 이미지 선택 및 미리보기, Supabase 업로드 연동.
- [ ] `SaveButton.tsx`: Project와 FormFields를 트랜잭션 형태로 저장하는 핸들러.

## Step 3: 페이지 조립
- [ ] `app/dashboard/new/page.tsx`: 빌더 컴포넌트를 배치한 새 프로젝트 생성 페이지.
- [ ] `app/[slug]/page.tsx`: 저장된 데이터를 기반으로 하는 공개용 폼 렌더링 페이지.