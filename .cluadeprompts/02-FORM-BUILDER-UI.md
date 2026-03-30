# Form Builder 및 랜딩 페이지 UI 가이드

## 🏗️ Form Builder (Admin Side)
- **State Management**: `fields` 상태를 배열로 관리 (`id`, `type`, `label` 등 포함).
- **Interactions**:
  - 왼쪽 사이드바: 필드 추가 버튼 (text, email, textarea, checkbox).
  - 중앙 캔버스: 추가된 필드 리스트, 실시간 라벨 수정, 삭제 기능.
  - 상단: 배너 이미지 업로드 및 미리보기 영역.

## 🌐 Dynamic Rendering (Public Side)
- **Path**: `app/[slug]/page.tsx`
- **Logic**:
  1. `slug`를 파라미터로 받아 Supabase에서 해당 `project`와 `form_fields` 조회.
  2. 조회된 필드들을 기반으로 실제 입력 폼 렌더링.
  3. 제출 시 `submissions` 테이블에 JSON 데이터 저장.

## 🎨 스타일링 테마
- 대시보드: Clean, Modern, White-gray background.
- 공개 폼: 배너 이미지가 상단에 위치하고 중앙 정렬된 심플한 폼 카드 형태.