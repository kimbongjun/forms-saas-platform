# 프로젝트 개요 & 폴더 구조

## 스택
- **Next.js 16** App Router · **TypeScript** · **Tailwind CSS v4** · **Supabase** (DB+Storage)
- **Resend** (이메일 알림) · **@dnd-kit** (드래그앤드롭) · **TinyMCE v8** (WYSIWYG, Tiptap에서 교체)
- **lucide-react** · **@supabase/ssr** · **zustand** (form-builder-store)
- **date-fns** + **react-day-picker** (날짜 처리)

## 핵심 규칙
- `params`는 반드시 `await` → `params: Promise<{id:string}>`
- Server Component → `createServerClient()` / Client Component → `createClient()` / 공개 폼(비인증) → `createPublicClient()`
- Tiptap → TinyMCE로 교체됨. `RichTextEditor.tsx`는 TinyMCE 기반
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
│   │   ├── blueberry/
│   │   │   ├── datalab/route.ts                    GET/POST (Naver DataLab API 연동)
│   │   │   └── naver/route.ts                      GET/POST (Naver 검색광고 API 연동)
│   │   ├── duplicate/route.ts                      POST (프로젝트 복제)
│   │   ├── projects/
│   │   │   ├── route.ts                            POST (신규 생성)
│   │   │   └── [id]/
│   │   │       ├── route.ts                        PUT (수정)
│   │   │       ├── budget/route.ts                 GET/PUT (예산 계획)
│   │   │       ├── clippings/route.ts              GET/POST (클리핑 목록·생성)
│   │   │       ├── clippings/parse/route.ts        POST (URL 메타데이터 자동 파싱)
│   │   │       ├── clippings/search/route.ts       POST (클리핑 검색)
│   │   │       ├── clippings/bulk/route.ts         POST (대량 클리핑)
│   │   │       ├── clippings/[clippingId]/route.ts PUT/DELETE
│   │   │       ├── deliverables/route.ts           GET/POST (결과물 목록·생성)
│   │   │       ├── deliverables/parse/route.ts     POST (소셜미디어 데이터 파싱)
│   │   │       ├── deliverables/search/route.ts    POST (결과물 검색)
│   │   │       ├── deliverables/bulk/route.ts      POST (대량 결과물)
│   │   │       ├── deliverables/sync/route.ts      POST (YouTube Data API 지표 동기화)
│   │   │       ├── deliverables/[deliverableId]/route.ts PUT/DELETE
│   │   │       ├── goals/route.ts                  GET/PUT (목표/KPI 계획)
│   │   │       ├── issues/route.ts                 GET/POST/PUT/DELETE
│   │   │       └── milestones/route.ts             GET/POST/PUT/DELETE
│   │   ├── submit/route.ts                         POST (공개 폼 제출)
│   │   ├── auth/callback/route.ts
│   │   └── site-logo/route.ts                      GET (다크모드 로고)
│   ├── auth/callback/route.ts
│   ├── dashboard/
│   │   ├── (builder)/
│   │   │   ├── new/page.tsx                        새 폼 빌더
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
│   │       ├── category/page.tsx
│   │       ├── kpi/page.tsx
│   │       └── realtime/page.tsx
│   │   └── [id]/responses/                         응답 확인 대시보드
│   │       ├── page.tsx
│   │       ├── export/route.ts                     CSV 내보내기
│   │       └── stats/page.tsx                      필드별 상세 통계
│   ├── blueberry/
│   │   ├── layout.tsx                              WorkspaceShell 래퍼
│   │   ├── page.tsx                                메타데이터 + BlueberryClient 마운트
│   │   ├── _components/
│   │   │   ├── BlueberryClient.tsx                 키워드 분석 메인 UI (Mock+Naver API 혼합)
│   │   │   └── DatalabForm.tsx                     DataLab API 입력 폼
│   │   └── datalab/
│   │       ├── page.tsx                            DataLab 결과 페이지
│   │       └── _components/
│   │           └── DatalabResultClient.tsx         DataLab 결과 시각화 (Client)
│   ├── engagement/
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
│   │       ├── budget/page.tsx                     예산 계획 (BudgetPlanner)
│   │       ├── edit/page.tsx                       프로젝트 편집
│   │       ├── execution/
│   │       │   ├── form-builder/page.tsx           폼 빌더 진입 (EditFormBuilder)
│   │       │   ├── forms/page.tsx                  폼/서베이 관리 목록
│   │       │   ├── forms/new/page.tsx
│   │       │   ├── forms/[formId]/page.tsx
│   │       │   ├── forms/[formId]/export/
│   │       │   ├── live-responses/                 응답 확인 + export
│   │       │   └── tasks/page.tsx                  칸반 (KanbanBoard)
│   │       ├── goals/page.tsx                      목표/KPI 설정 (GoalPlanner)
│   │       ├── insights/page.tsx                   인사이트 대시보드 (SNS 합산, KPI)
│   │       ├── issues/                             이슈 트래커 (IssueTracker)
│   │       ├── outputs/                            산출물 & 인게이지먼트
│   │       │   ├── deliverables/page.tsx           개별 산출물 리스트 (Instagram/YouTube 등)
│   │       │   └── clippings/page.tsx              보도자료·외부 링크 아카이빙
│   │       └── schedule/                           간트 차트 (GanttChart)
│   ├── release-notes/
│   ├── service/page.tsx
│   ├── shared/
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
│   │   ├── FieldLabelEditor.tsx                    필드 레이블 에디터
│   │   ├── MapFieldEditor.tsx
│   │   ├── PreviewModal.tsx                        빌더 내 폼 미리보기 모달
│   │   ├── ResponsesTab.tsx                        응답 탭 (EditFormBuilder 전용)
│   │   ├── RichTextEditor.tsx                      TinyMCE WYSIWYG (SSR 제외, dynamic import)
│   │   ├── SaveButton.tsx                          신규 저장 핸들러
│   │   └── SettingsPanel.tsx                       설정 탭 (테마·알림·마감·이메일·다국어)
│   ├── common/
│   │   ├── DatePickerInput.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── PublicSiteFrame.tsx                     공개 페이지 공통 레이아웃 래퍼
│   │   ├── SiteFooter.tsx
│   │   ├── SiteHeader.tsx
│   │   ├── SiteLogo.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/
│   │   ├── AccountForm.tsx
│   │   ├── AdminUserList.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ResponsesTable.tsx
│   │   └── UserMenu.tsx
│   ├── form/PublicForm.tsx                         공개 폼 렌더 + 제출 (Client)
│   └── workspace/
│       ├── BudgetPlanner.tsx                       예산 계획 도구 (항목별 금액/가중치)
│       ├── GoalPlanner.tsx                         목표/KPI 관리 테이블 (정량/정성 평가)
│       ├── KanbanBoard.tsx                         칸반 보드 (Task 관리)
│       ├── ProjectSectionNav.tsx
│       ├── ProjectWizard.tsx                       프로젝트 생성 위자드
│       ├── WorkspaceLayout.tsx
│       ├── WorkspacePage.tsx
│       ├── WorkspaceShell.tsx                      프로젝트 상세 레이아웃 셸
│       └── WorkspaceSidebar.tsx
├── constants/
│   ├── branding.ts                                 APP_TITLE = '마케팅 프로젝트 관리 시스템'
│   ├── builder.ts                                  INPUT_TYPES, CONTENT_TYPES, PRESET_COLORS
│   ├── countries.ts                                국가 리스트
│   ├── ia.ts                                       WORKSPACE_HUBS, PROJECT_NAV_GROUPS
│   └── locale.ts                                   Locale 타입, resolveLocaleStrings()
├── features/
│   ├── clippings/
│   │   ├── parser.ts                               URL 메타데이터 파싱 (og:title 등)
│   │   └── types.ts                                클리핑 타입 정의
│   └── deliverables/
│       ├── parser.ts                               소셜미디어 데이터 파싱 (IG/YouTube)
│       └── types.ts                                결과물 타입 정의
├── hooks/
│   └── useEscapeKey.ts                             ESC 키 처리
├── stores/
│   └── form-builder-store.ts                       zustand (빌더 전역 상태)
├── types/
│   ├── database.ts                                 FieldType, FormField, Project, Submission 등
│   └── project-task.ts                             프로젝트 작업 상태·진행도
└── utils/
    ├── money.ts                                    통화 포맷팅
    ├── public-content.ts                           공지사항·릴리즈노트 공개 조회
    ├── rich-text.ts                                stripHtml() HTML 태그 제거
    ├── site-settings.ts                            GlobalSiteSettings + 색상 변환 유틸
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
  ├── projects              폼+프로젝트 메타데이터 (user_id FK, RLS 소유자 보호)
  ├── form_fields           필드 정의 (project_id CASCADE)
  ├── submissions           응답 데이터 (anon INSERT 허용)
  ├── project_members       프로젝트 멤버
  ├── project_milestones    간트 차트 마일스톤
  ├── project_issues        이슈 트래커
  ├── project_budget_plans  예산 계획 (항목 JSON)
  ├── project_clippings     보도자료·외부 링크 아카이빙
  ├── project_deliverables  산출물 (Instagram/YouTube 등 소셜 콘텐츠)
  ├── announcements         공지사항
  ├── release_notes         릴리즈노트
  └── site_settings         글로벌 사이트 설정 (단일 행, id=1)

Supabase Storage (banners 버킷, public)
  ├── project-banners/{uuid}   배너
  ├── field-images/{uuid}      필드 이미지
  ├── thumbnails/{uuid}        폼 썸네일
  └── site-assets/             OG 이미지, 파비콘
```

## features/ 파서 모듈

### clippings/parser.ts
- `parseClippingUrl(url)` — og:title, og:description, og:image, 발행일 추출 (타임아웃 8초)

### deliverables/parser.ts
- `parseDeliverableUrl(url)` — Instagram·YouTube·TikTok 링크에서 통계(조회수, 좋아요, 댓글) 추출
- 플랫폼 자동 감지: `instagram.com`, `youtube.com`/`youtu.be`, `tiktok.com`

## utils/site-settings.ts 색상 유틸
- `getGlobalSiteSettings()` — DB에서 site_settings 조회
- `getResolvedPrimaryPalette()` — 10가지 명도 변형 팔레트 생성 (다크모드 포함)
- `hexToRgb()`, `darken()`, `lighten()`, `getReadableTextColor()`, `ensureButtonContrast()`
