# 구현 완료 기능 & API 라우트

## 필드 타입 목록 (FieldType 17종)

| 타입 | 분류 | content | options | 비고 |
|---|---|---|---|---|
| text | 입력 | - | - | 단문 텍스트 |
| email | 입력 | - | - | 이메일 |
| textarea | 입력 | - | - | 장문 텍스트 |
| checkbox | 입력 | - | - | 단일 체크 (동의) |
| select | 입력 | - | ✅ | 드롭다운 |
| radio | 입력 | - | ✅ | 단일 선택 + conditional logic |
| checkbox_group | 입력 | - | ✅ | 복수 체크 |
| rating | 입력 | ✅ 최대점수 | - | 별점 (3/5/10점) |
| section | 구조 | - | - | 다단계 폼 분할 |
| html | 꾸밈 | ✅ HTML | - | Tiptap WYSIWYG |
| text_block | 꾸밈 | ✅ 텍스트 | - | 평문 단락 |
| image | 꾸밈 | ✅ URL | - | 이미지+캡션 |
| divider | 꾸밈 | - | - | 수평선 |
| map | 꾸밈 | ✅ embed URL | - | Google Maps iframe |
| youtube | 꾸밈 | ✅ 영상 URL | - | YouTube 반응형 |
| table | 꾸밈 | ✅ JSON | - | 행/열 테이블 |

---

## API 라우트 전체 목록

| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/projects` | 폼 생성 | 로그인 |
| PUT | `/api/projects/[id]` | 폼 수정 + 필드 저장 | 소유자 |
| POST | `/api/duplicate` | 폼 복제 (비공개 상태) | 소유자 |
| POST | `/api/submit` | 공개 폼 제출 | anon |
| GET | `/api/admin/settings` | 사이트 설정 조회 | 관리자 |
| PUT | `/api/admin/settings` | 사이트 설정 저장 | 관리자 |
| GET | `/api/admin/users` | 회원 목록 | 관리자 |
| PUT | `/api/admin/update-role` | 역할 변경 | 관리자 |
| POST | `/api/admin/reset-password` | 비밀번호 초기화 | 관리자 |
| DELETE | `/api/admin/delete-user` | 회원 삭제 | 관리자 |
| POST | `/api/admin/announcements` | 공지사항 생성 | 관리자 |
| PUT | `/api/admin/announcements/[id]` | 공지사항 수정 | 관리자 |
| DELETE | `/api/admin/announcements/[id]` | 공지사항 삭제 | 관리자 |
| POST | `/api/admin/release-notes` | 릴리즈노트 생성 | 관리자 |
| POST | `/api/admin/release-notes/generate` | git 커밋 기반 자동 생성 | 관리자 |
| PUT | `/api/admin/release-notes/[id]` | 릴리즈노트 수정 | 관리자 |
| DELETE | `/api/admin/release-notes/[id]` | 릴리즈노트 삭제 | 관리자 |
| GET | `/api/projects/[id]/milestones` | 마일스톤 목록 | 소유자 |
| POST | `/api/projects/[id]/milestones` | 마일스톤 생성 | 소유자 |
| PUT | `/api/projects/[id]/milestones` | 마일스톤 수정 | 소유자 |
| DELETE | `/api/projects/[id]/milestones` | 마일스톤 삭제 | 소유자 |
| GET | `/api/projects/[id]/issues` | 이슈 목록 | 소유자 |
| POST | `/api/projects/[id]/issues` | 이슈 생성 | 소유자 |
| PUT | `/api/projects/[id]/issues` | 이슈 수정 | 소유자 |
| DELETE | `/api/projects/[id]/issues` | 이슈 삭제 | 소유자 |
| GET | `/dashboard/(main)/[id]/responses/export` | CSV 내보내기 | 소유자 |
| GET | `/projects/[id]/execution/live-responses/export` | CSV 내보내기 (워크스페이스) | 소유자 |

---

## 구현 완료 기능 요약

### 빌더
- 17가지 필드 타입, DnD 순서 변경 (@dnd-kit)
- 탭 구조: [편집] [설정] [응답] (BuilderTabBar)
- 다단계(section) + 진행바 + 다음/이전
- Conditional Logic: radio → 섹션 분기 (form_fields.logic jsonb)
- 테마 컬러 프리셋 8종 + 커스텀

### 설정 탭 (SettingsPanel)
- 테마 컬러, 배너/썸네일 업로드
- 알림 이메일, 제출 완료 메시지
- 마감일(deadline), 최대 응답 수, 공개/비공개 토글
- 웹훅 URL (제출 시 JSON POST)
- 관리자·응답자 이메일 템플릿 (Tiptap)
- 다국어 설정 (ko/en/ja/zh + 텍스트 오버라이드)
- SEO 설정 (seo_title, seo_description, seo_og_image)

### 공개 폼
- slug 기반 접근, 비공개/마감/최대응답 수 검사
- 다국어 언어 전환 버튼
- map URL 하위 호환 자동 변환 (embed/v1 → 신규 포맷)

### 응답 관리
- 응답 테이블 (20건 페이지네이션, 행 클릭 → 상세 모달)
- 필드별 상세 통계 (SVG 파이차트, 바차트, 평점분포, 텍스트 목록)
- CSV 내보내기 (BOM UTF-8, Excel 한글 호환)

### 프로젝트 워크스페이스
- 생성 위자드 (카테고리 → 기본정보 → 팀 셋업)
- 개요(Overview): 카테고리, 기간, 예산, 멤버
- 일정: 간트 차트 (GanttChart, project_milestones)
- 실행: 칸반 태스크(KanbanBoard), 폼/서베이 관리, 라이브 응답
- 이슈 트래커 (IssueTracker): 유형(bug/suggestion/question) + 긴급도

### 관리자
- 사용자 관리: 역할 변경, 비밀번호 초기화, 삭제
- 사이트 설정: SEO, OG 이미지, 파비콘, 약관 WYSIWYG
- 공지사항 / 릴리즈노트 CRUD + git 자동 생성

### 인프라
- Supabase Auth (middleware 보호), profiles.role 기반 권한
- `createPublicClient()`: 비인증 공개 폼 전용 (cache: 'no-store')
- Resend 이메일 (관리자 알림 + 응답자 확인)
