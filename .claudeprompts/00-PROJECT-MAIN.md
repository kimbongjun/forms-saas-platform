# 프로젝트 개요 & 폴더 구조

## 스택
- **Next.js 16** App Router · **TypeScript** · **Tailwind CSS v4** · **Supabase** (DB+Storage)
- **Resend** (이메일 알림) · **@dnd-kit** (드래그앤드롭) · **Tiptap v2** (WYSIWYG)
- **lucide-react** · **@supabase/ssr** · **zustand** (form-builder-store)

## 핵심 규칙
- `params`는 반드시 `await` → `params: Promise<{id:string}>`
- Server Component → `createServerClient()` / Client Component → `createClient()` / 공개 폼(비인증) → `createPublicClient()`
- Tiptap: `dynamic(...,{ssr:false})` + `immediatelyRender: false` 필수
- 타입 정의: `src/types/database.ts` (FieldType, FormField, Project, Submission 등)
- 슬러그: ASCII-only 자동 생성 (`form-{rand6}`, 한글 제거)

## 폴더 구조
```
src/
├── app/
│   ├── [slug]/page.tsx                             공개 폼 뷰 (Server) — 비공개/마감/최대응답 검사
│   ├── announcements/                              공지사항 목록·상세 (PublicSiteFrame 레이아웃)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── announcements/route.ts              POST (생성)
│   │   │   ├── announcements/[id]/route.ts         PUT/DELETE
│   │   │   ├── delete-user/route.ts                DELETE (auth.admin)
│   │   │   ├── release-notes/route.ts              POST
│   │   │   ├── release-notes/generate/route.ts     POST (git 자동 생성)
│   │   │   ├── release-notes/[id]/route.ts         PUT/DELETE
│   │   │   ├── reset-password/route.ts             POST
│   │   │   ├── settings/route.ts                   GET/PUT (site_settings)
│   │   │   ├── update-role/route.ts                PUT
│   │   │   └── users/route.ts                      GET (admin API)
│   │   ├── duplicate/route.ts                      POST (프로젝트 복제)
│   │   ├── projects/
│   │   │   ├── route.ts                            POST (신규 생성)
│   │   │   └── [id]/
│   │   │       ├── route.ts                        PUT (수정)
│   │   │       ├── issues/route.ts                 GET/POST/PUT/DELETE
│   │   │       └── milestones/route.ts             GET/POST/PUT/DELETE
│   │   └── submit/route.ts                         POST (공개 폼 제출)
│   ├── auth/callback/route.ts
│   ├── dashboard/
│   │   ├── (builder)/
│   │   │   ├── new/page.tsx                        새 폼 빌더 (FormBuilder 없음, 현재 project 연결)
│   │   │   └── [id]/edit/page.tsx                  폼 편집 (EditFormBuilder)
│   │   └── (main)/
│   │       ├── layout.tsx                          DashboardMainLayout (헤더+사이드바)
│   │       ├── page.tsx                            폼 목록 (ProjectList)
│   │       ├── account/page.tsx
│   │       ├── admin/
│   │       │   ├── announcements/                  관리자 공지사항 관리 (CRUD)
│   │       │   ├── release-notes/                  관리자 릴리즈노트 관리
│   │       │   ├── settings/                       사이트 설정 (AdminSettingsForm)
│   │       │   └── users/page.tsx                  회원 관리 (AdminUserList)
│   │       ├── category/page.tsx                   (준비중)
│   │       ├── kpi/page.tsx                        (준비중)
│   │       └── realtime/page.tsx                   (준비중)
│   │   └── [id]/responses/                         응답 확인 대시보드
│   │       ├── page.tsx
│   │       ├── export/route.ts                     CSV 내보내기
│   │       └── stats/page.tsx                      필드별 상세 통계
│   ├── engagement/                                 (준비중)
│   │   ├── leads/page.tsx
│   │   └── templates/page.tsx
│   ├── layout.tsx                                  글로벌 레이아웃 (동적 메타데이터)
│   ├── login/page.tsx
│   ├── page.tsx                                    랜딩 페이지
│   ├── privacy/page.tsx
│   ├── projects/                                   프로젝트 워크스페이스
│   │   ├── layout.tsx
│   │   ├── page.tsx                                프로젝트 목록
│   │   ├── new/
│   │   │   ├── page.tsx                            ProjectWizard Step 1
│   │   │   └── build/page.tsx                      ProjectWizard Step 2+
│   │   └── [id]/
│   │       ├── layout.tsx                          WorkspaceShell (사이드바+헤더)
│   │       ├── page.tsx                            Overview (기본)
│   │       ├── _components/TabNavigation.tsx
│   │       ├── execution/
│   │       │   ├── form-builder/page.tsx           폼 빌더 진입 (EditFormBuilder)
│   │       │   ├── forms/page.tsx                  폼/서베이 관리 목록
│   │       │   ├── live-responses/                 응답 확인 + export
│   │       │   └── tasks/page.tsx                  칸반 (KanbanBoard)
│   │       ├── issues/                             이슈 트래커 (IssueTracker)
│   │       └── schedule/                           간트 차트 (GanttChart)
│   ├── release-notes/                              릴리즈노트 목록·상세
│   ├── service/page.tsx
│   ├── shared/                                     (준비중)
│   └── terms/page.tsx
├── components/
│   ├── auth/AuthForm.tsx
│   ├── builder/                                    (모두 'use client')
│   │   ├── BuilderCanvas.tsx                       DnD 캔버스 (FieldCard 목록)
│   │   ├── BuilderSidebar.tsx                      필드 팔레트 (INPUT_TYPES, CONTENT_TYPES)
│   │   ├── BuilderTabBar.tsx                       탭 전환 (편집/설정/응답)
│   │   ├── BannerUpload.tsx
│   │   ├── EditFormBuilder.tsx                     편집 빌더 루트 컴포넌트
│   │   ├── FieldCard.tsx                           개별 필드 카드 (17종 타입)
│   │   ├── MapFieldEditor.tsx
│   │   ├── PreviewModal.tsx                        빌더 내 폼 미리보기 모달
│   │   ├── ResponsesTab.tsx                        응답 탭 (EditFormBuilder 전용)
│   │   ├── RichTextEditor.tsx                      Tiptap WYSIWYG (SSR 제외)
│   │   ├── SaveButton.tsx                          신규 저장 핸들러
│   │   └── SettingsPanel.tsx                       설정 탭 (테마·알림·마감·이메일·다국어)
│   ├── common/
│   │   ├── PublicSiteFrame.tsx                     공개 페이지 공통 레이아웃 래퍼
│   │   ├── SiteFooter.tsx
│   │   └── SiteHeader.tsx
│   ├── dashboard/
│   │   ├── AccountForm.tsx
│   │   ├── AdminUserList.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ResponsesTable.tsx
│   │   └── UserMenu.tsx
│   ├── form/PublicForm.tsx                         공개 폼 렌더 + 제출 (Client)
│   └── workspace/
│       ├── KanbanBoard.tsx                         칸반 보드 (Task 관리)
│       ├── ProjectSectionNav.tsx
│       ├── ProjectWizard.tsx                       프로젝트 생성 위자드
│       ├── WorkspaceLayout.tsx
│       ├── WorkspacePage.tsx
│       ├── WorkspaceShell.tsx                      프로젝트 상세 레이아웃 셸
│       └── WorkspaceSidebar.tsx
├── constants/
│   ├── branding.ts                                 APP_TITLE 등 브랜딩 상수
│   ├── builder.ts                                  INPUT_TYPES, CONTENT_TYPES, PRESET_COLORS
│   ├── ia.ts                                       WORKSPACE_HUBS, PROJECT_NAV_GROUPS
│   └── locale.ts                                   Locale 타입, resolveLocaleStrings()
├── stores/
│   └── form-builder-store.ts                       zustand (빌더 전역 상태)
├── types/
│   ├── database.ts                                 FieldType, FormField, Project, Submission 등
│   └── form.ts
└── utils/
    ├── public-content.ts                           공지사항·릴리즈노트 공개 조회
    ├── site-settings.ts                            GlobalSiteSettings (site_settings 테이블)
    └── supabase/
        ├── admin.ts                                createAdminClient() — service_role key
        ├── client.ts                               createClient() — 브라우저 (인증 세션)
        ├── public.ts                               createPublicClient() — 비인증 공개 폼용
        ├── server.ts                               createServerClient() + getUserRole()
        └── storage.ts                              uploadBanner / uploadFieldImage / uploadThumbnail / uploadSiteAsset
```

## 데이터 흐름 요약
```
Supabase Auth
  ├── 쿠키 세션 → middleware.ts가 /dashboard, /projects 보호
  ├── profiles 테이블 → role (editor / administrator)
  └── auth.admin API → 회원 삭제·비밀번호 초기화 (service_role key)

Supabase DB
  ├── projects          폼 메타데이터 (user_id FK, RLS 소유자 보호)
  ├── form_fields        필드 정의 (project_id CASCADE)
  ├── submissions        응답 데이터 (anon INSERT 허용)
  ├── project_members    프로젝트 멤버
  ├── project_milestones 간트 차트 마일스톤
  ├── project_issues     이슈 트래커
  ├── announcements      공지사항
  ├── release_notes      릴리즈노트
  └── site_settings      글로벌 사이트 설정 (단일 행, id=1)

Supabase Storage (banners 버킷, public)
  ├── project-banners/{uuid}   배너
  ├── field-images/{uuid}      필드 이미지
  ├── thumbnails/{uuid}        폼 썸네일
  └── site-assets/             OG 이미지, 파비콘
```
