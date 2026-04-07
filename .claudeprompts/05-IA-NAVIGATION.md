# IA & 네비게이션 구조

## 1. 전체 사이트맵

```
/                               홈 (랜딩)
├── /login                      로그인 / 회원가입
├── /[slug]                     공개 폼 응답 페이지 (비인증)
├── /announcements              공지사항 목록
│   └── /announcements/[id]     공지사항 상세
├── /release-notes              릴리즈노트 목록
│   └── /release-notes/[id]     릴리즈노트 상세
├── /privacy, /terms, /service  약관 페이지
│
├── /dashboard                  대시보드 (인증 필수)
│   ├── /dashboard              폼 목록 (ProjectList)
│   ├── /dashboard/(builder)/new        새 폼 빌더
│   ├── /dashboard/(builder)/[id]/edit  폼 편집 빌더
│   ├── /dashboard/(main)/[id]/responses        응답 확인 테이블
│   │   ├── /responses/stats    필드별 상세 통계
│   │   └── /responses/export   CSV 내보내기
│   ├── /dashboard/account      계정 설정
│   └── /dashboard/admin/       관리자 전용
│       ├── users               회원 관리
│       ├── settings            사이트 설정
│       ├── announcements       공지사항 관리
│       └── release-notes       릴리즈노트 관리
│
└── /projects                   프로젝트 워크스페이스 (인증 필수)
    ├── /projects               프로젝트 목록
    ├── /projects/new           위자드 Step 1 (카테고리 선택)
    │   └── /projects/new/build 위자드 Step 2+
    └── /projects/[id]          프로젝트 상세 (WorkspaceShell)
        ├── (기본)              Overview (개요)
        ├── /budget             예산 계획 (BudgetPlanner)
        ├── /schedule           일정 – 간트 차트
        ├── /execution/
        │   ├── tasks           Task & WBS (칸반)
        │   ├── forms           폼/서베이 목록
        │   │   ├── new         새 폼 생성
        │   │   └── [formId]    폼 편집
        │   │       └── export  응답 CSV 내보내기
        │   ├── form-builder    폼 빌더 (EditFormBuilder)
        │   └── live-responses  라이브 응답 + 통계 + CSV
        ├── /outputs/           산출물 & 인게이지먼트
        │   ├── deliverables    소셜 콘텐츠 목록 (IG/YT 등 + 실시간 지표)
        │   └── clippings       보도자료·외부 링크 아카이빙
        ├── /insights           전체 운영 결과 인사이트 대시보드
        └── /issues             이슈 트래커
```

---

## 2. 역할별 접근 권한

| 페이지 / 기능 | anon | editor | administrator |
|---|:---:|:---:|:---:|
| `/[slug]` 공개 폼 제출 | ✅ | ✅ | ✅ |
| `/login` | ✅ | — | — |
| 공지사항·릴리즈노트·약관 (공개) | ✅ | ✅ | ✅ |
| `/dashboard` 폼 목록·빌더·응답 | ❌ | ✅ | ✅ |
| `/projects` 워크스페이스 | ❌ | ✅ | ✅ |
| 계정 설정 | ❌ | ✅ | ✅ |
| 사용자 관리·사이트 설정 | ❌ | ❌ | ✅ |
| 공지사항·릴리즈노트 관리 | ❌ | ❌ | ✅ |

> 권한 판별: `utils/supabase/server.ts` → `getUserRole(userId)` (profiles 테이블)
> 관리자 API는 서버에서 role 재검증 수행

---

## 3. 레이아웃 구조

### 공개 페이지 (PublicSiteFrame)
- Header: `SiteHeader` (로고 + 공지사항·릴리즈노트 링크)
- Footer: `SiteFooter`

### 대시보드 (DashboardMainLayout — `/dashboard/(main)/layout.tsx`)
- Header: 로고·공지사항·릴리즈노트·UserMenu
- Sidebar: `DashboardSidebar` (폼 목록, 새 프로젝트)
- UserMenu 드롭다운: 계정 설정, 로그아웃 (+관리자 항목)

### 프로젝트 워크스페이스 (WorkspaceShell — `/projects/[id]/layout.tsx`)
- Sidebar: `WorkspaceSidebar` (WORKSPACE_HUBS + PROJECT_NAV_GROUPS from `constants/ia.ts`)
- Header: 프로젝트명·상태 + UserMenu
- 탭 네비: `TabNavigation` (개요/일정/실행/이슈/산출물/인사이트)

---

## 4. 주요 사용자 플로우

### 에디터 — 폼 생성 (독립 대시보드)
```
/dashboard → "새 폼 만들기" → /dashboard/(builder)/new
  → FormBuilder (편집/설정 탭) → POST /api/projects → /dashboard
```

### 에디터 — 프로젝트 내 폼 관리
```
/projects/[id]/execution/forms → "폼 만들기"
  → /projects/[id]/execution/form-builder → EditFormBuilder
  → 저장 → /projects/[id]/execution/forms
```

### 응답자 — 공개 폼 제출
```
/[slug] → SlugPage (Server: 제한검사) → PublicForm
  → POST /api/submit → submissions INSERT → Resend 이메일 → 완료 메시지
```

### 관리자 — 회원 관리
```
UserMenu → /dashboard/admin/users → AdminUserList
  → 역할 변경 / 비밀번호 초기화 / 삭제
```

### 마케터 — 산출물 등록 & 지표 확인
```
/projects/[id]/outputs/deliverables → "산출물 등록" → URL 입력
  → POST /api/projects/[id]/deliverables/parse (플랫폼 자동 감지·지표 파싱)
  → 목록 저장 → 1시간 단위 자동 갱신 or 수동 새로고침
```

### 마케터 — 인사이트 확인
```
/projects/[id]/insights → deliverables + clippings 집계
  → KPI 합산 (전체 조회/노출, 인게이지먼트, 보도자료 수)
  → 목표 달성률 시각화
```

---

## 5. 새 페이지·API 추가 시 체크리스트

### 새 페이지
1. `src/app/...` 에 `page.tsx` 생성
2. 인증 필요 → `middleware.ts` matcher 확인 (`/dashboard`, `/projects` 이미 포함)
3. 관리자 전용 → `getUserRole()` 서버 검증
4. 이 문서 §1 사이트맵 업데이트

### 새 API 라우트
1. `src/app/api/...` 에 `route.ts` 생성
2. 인증 체크: `createServerClient()` → `getUser()`
3. 관리자 전용: `getUserRole()` → `'administrator'`
4. `03-FEATURES.md` API 목록 업데이트

### 새 필드 타입
1. `src/types/database.ts` — FieldType union 확장
2. `src/components/builder/FieldCard.tsx` — 빌더 렌더 추가
3. `src/components/form/PublicForm.tsx` — 공개 폼 렌더 추가
4. `src/constants/builder.ts` — 팔레트에 추가
5. Supabase DB — `form_fields_type_check` 제약 업데이트
6. `01-SUPABASE-SCHEMA.md` 타입 목록 업데이트

### 새 DB 테이블
1. Supabase SQL Editor에서 마이그레이션 실행
2. RLS 정책 설정 (authenticated 소유자 검증 패턴)
3. `src/types/database.ts` 에 타입 추가
4. `01-SUPABASE-SCHEMA.md` 테이블 정의 및 마이그레이션 히스토리 업데이트
