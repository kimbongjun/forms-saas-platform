# Supabase 인프라 및 타입 설정 가이드

## 🛠 생성 파일 목록 및 위치
1. `types/database.ts`: 프로젝트 전체에서 사용할 인터페이스 정의.
2. `utils/supabase/client.ts`: 클라이언트 사이드(브라우저)용 Supabase 인스턴스.
3. `utils/supabase/storage.ts`: 이미지 업로드 및 URL 관리 유틸리티.

## 📐 상세 타입 정의 (types/database.ts)
- `Project`: id(uuid), title(text), slug(text), banner_url(text), user_id(uuid).
- `FormField`: id(uuid), project_id(uuid), label(text), type(FieldType), order_index(int).
- `FieldType`: 'text' | 'email' | 'textarea' | 'checkbox' 유니온 타입.

## ⚙️ 구현 세부 사항
- **Client**: `createBrowserClient`를 사용하여 환경 변수(`NEXT_PUBLIC_...`) 로드.
- **Storage**: `banners` 버킷 사용. 파일명은 `crypto.randomUUID()`를 활용해 중복 방지.
- **Error Handling**: 모든 DB/Storage 작업에 `try-catch` 및 에러 로그 포함.