# 구현 현황 & 기능 목록

## ✅ 완료된 기능

### 인프라
- [x] `types/database.ts` — FieldType(13종), FormField, Project, Submission
- [x] `utils/supabase/client.ts` — createClient (브라우저)
- [x] `utils/supabase/server.ts` — createServerClient (서버)
- [x] `utils/supabase/storage.ts` — uploadBanner

### 빌더
- [x] `FormBuilder.tsx` — 신규 프로젝트 생성 (사이드바 + 캔버스 2컬럼)
- [x] `EditFormBuilder.tsx` — 기존 프로젝트 편집
- [x] `FieldCard.tsx` — 13가지 필드 타입 카드 (DnD, 라벨, 옵션, 컨텐츠, 미리보기)
- [x] `MapFieldEditor.tsx` — Google Maps iframe 붙여넣기 (API 불필요, 비용 없음, 실시간 미리보기)
- [x] `BannerUpload.tsx` — 배너 이미지 선택·미리보기·제거
- [x] `SaveButton.tsx` — 트랜잭션 저장 (projects → form_fields)
- [x] `RichTextEditor.tsx` — Tiptap WYSIWYG (SSR 제외)
- [x] 드래그앤드롭 순서 변경 (@dnd-kit)
- [x] 테마 컬러 선택 (프리셋 8종 + 커스텀 color picker)

### 대시보드
- [x] `dashboard/page.tsx` — 프로젝트 목록 (Server)
- [x] `ProjectList.tsx` — 목록 카드, 개별 삭제, 일괄 삭제, 공개 폼 뷰 버튼

### 공개 폼
- [x] `[slug]/page.tsx` — slug로 project+fields 조회 (Server)
- [x] `PublicForm.tsx` — 13가지 필드 렌더 + 제출 + 테마 컬러 적용
- [x] `api/submit/route.ts` — submissions INSERT + Resend 이메일 발송

## 필드 타입 목록 (FieldType 13종)

| 타입 | 분류 | 설명 | content | options | 빌더 미리보기 |
|---|---|---|---|---|---|
| text | 입력 | 단문 텍스트 | - | - | - |
| email | 입력 | 이메일 입력 | - | - | - |
| textarea | 입력 | 장문 텍스트 | - | - | - |
| checkbox | 입력 | 단일 체크 (동의) | - | - | - |
| select | 입력 | 드롭다운 선택 | - | ✅ | - |
| radio | 입력 | 라디오 단일 선택 | - | ✅ | - |
| checkbox_group | 입력 | 복수 체크 선택 | - | ✅ | - |
| html | 꾸밈 | WYSIWYG HTML 블록 | ✅ HTML | - | - |
| text_block | 꾸밈 | 평문 텍스트 단락 | ✅ 텍스트 | - | - |
| image | 꾸밈 | 이미지 + 캡션 | ✅ URL | - | ✅ img |
| divider | 꾸밈 | 수평선 구분선 | - | - | ✅ hr |
| map | 꾸밈 | Google Maps embed | ✅ embed URL | - | ✅ iframe |
| youtube | 꾸밈 | YouTube 영상 | ✅ 영상 URL | - | ✅ iframe |

## API 라우트

### POST /api/submit
```typescript
// Body
{ projectId: string, answers: Record<string, string|boolean|string[]>, fields: {id,label,type}[] }
// 동작
// 1. submissions INSERT
// 2. project.notification_email 있으면 + RESEND_API_KEY 있으면 → Resend 이메일 발송
// 이메일 스킵 타입: html, map, youtube, text_block, image, divider
```

## 주요 설계 결정 사항

| 항목 | 결정 | 이유 |
|---|---|---|
| Google Maps | Places API 미사용, iframe 직접 붙여넣기 | API 비용 발생 방지 |
| map embed URL | `maps.google.com/maps?q=...&output=embed` | Maps Embed API 별도 활성화 불필요 |
| YouTube embed | videoId 파싱 → `youtube.com/embed/{id}` | 표준 embed 방식 |
| 슬러그 | ASCII-only (`form-{rand6}`) | 한글 URL 인코딩 이슈 방지 |
| 이미지 | URL 입력 방식 | Storage 업로드 복잡도 제거 |
| Tiptap SSR | `dynamic(ssr:false)` + `immediatelyRender:false` | hydration mismatch 방지 |

## 향후 작업 (미구현)
- [ ] 응답 확인 대시보드 (submissions 조회·표시)
- [ ] 사용자 인증 (Supabase Auth)
- [ ] 폼 공개/비공개 토글
- [ ] 제출 마감일·최대 응답 수 설정
- [ ] 이미지 필드 — 파일 직접 업로드 (Supabase Storage 연동)
