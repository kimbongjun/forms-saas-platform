# Supabase 스키마 & 설정

## 테이블 정의

### projects
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| title | text NOT NULL | |
| slug | text UNIQUE NOT NULL | ASCII-only, form-{rand} |
| banner_url | text | Storage 공개 URL |
| notification_email | text | 응답 알림 수신 이메일 |
| theme_color | text | hex 색상값, 기본 #111827 |
| is_published | boolean | DEFAULT true, false면 공개 폼 접근 차단 |
| deadline | timestamptz | 제출 마감일시, NULL이면 제한 없음 |
| max_submissions | int | 최대 응답 수, NULL이면 제한 없음 |
| webhook_url | text | 제출 시 POST 발송할 외부 URL |
| submission_message | text | 제출 완료 후 표시할 커스텀 메시지 (NULL이면 기본값) |
| admin_email_template | text | 관리자 수신 이메일 HTML 템플릿 (NULL이면 기본 템플릿) |
| user_email_template | text | 응답자 수신 이메일 HTML 템플릿 (NULL이면 미발송) |
| thumbnail_url | text | 폼 썸네일 이미지 Storage 공개 URL |
| locale_settings | jsonb | 다국어 설정 (LocaleSettings 타입, NULL이면 기본 ko) |
| seo_title | text | 폼 SEO 타이틀 (NULL이면 project.title 사용) |
| seo_description | text | 폼 SEO 설명 |
| seo_og_image | text | 폼 OG 이미지 URL |
| user_id | uuid | Supabase Auth uid, 소유권 판별에 사용 |
| category | text | 프로젝트 카테고리 |
| start_date | date | 프로젝트 시작일 |
| end_date | date | 프로젝트 종료일 |
| budget | bigint | 총 예산 (원화 기준) |
| country | text | 프로젝트 국가 |
| venue_name | text | 행사장 이름 |
| venue_map_url | text | 행사장 지도 URL |
| workspace_project_id | uuid | 부모 워크스페이스 프로젝트 ID |
| created_at | timestamptz | now() |

### form_fields
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| label | text | 필드 제목 |
| description | text | 필드 상세 설명 (레이블 아래 표시, NULL이면 미표시) |
| type | text CHECK | FieldType 17종 참조 |
| required | boolean | |
| order_index | int | DnD 순서 |
| options | jsonb | select/radio/checkbox_group 선택지 배열 |
| content | text | html(WYSIWYG HTML), map/youtube URL, text_block 텍스트, image URL |
| logic | jsonb | radio 조건분기: { "optionValue": "sectionFieldId" } |
| created_at | timestamptz | |

**FieldType CHECK:**
`'text','email','textarea','checkbox','select','radio','checkbox_group','rating','section','html','map','youtube','text_block','image','divider','table'`

### submissions
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| answers | jsonb NOT NULL | `{fieldId: string \| boolean \| string[]}` |
| created_at | timestamptz | |

### profiles
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | auth.users.id 와 동일 |
| role | text | 'editor' \| 'administrator', DEFAULT 'editor' |

### announcements
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| title | text NOT NULL | |
| content | text NOT NULL | DEFAULT '' |
| author_id | uuid | |
| is_published | boolean | DEFAULT true |
| is_pinned | boolean | DEFAULT false |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

### release_notes
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| version | text NOT NULL | e.g. v1.2.0 |
| title | text NOT NULL | |
| content | text NOT NULL | DEFAULT '' |
| created_at | timestamptz | now() |

### site_settings
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | int PK | 항상 1 (단일 행) |
| settings | jsonb | GlobalSiteSettings (site_title, description, og_image_url, favicon_url, footer_text, privacy_policy, terms_of_service, service_agreement 등) |

### project_members
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| name | text NOT NULL | 멤버 이름 |
| email | text | 알림 수신 이메일 (NULL 허용) |
| role | text NOT NULL | 'owner' \| 'manager' \| 'member' \| 'viewer' |
| department | text | 소속 부서 (NULL 허용) |
| notify | boolean | DEFAULT true — 이메일 알림 수신 여부 |
| created_at | timestamptz | now() |

### project_milestones
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| title | text NOT NULL | |
| description | text | DEFAULT '' |
| start_date | date NOT NULL | |
| end_date | date NOT NULL | |
| progress | int | DEFAULT 0, CHECK 0~100 |
| status | text | 'not_started' \| 'in_progress' \| 'completed' |
| created_at | timestamptz | |

### project_issues
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| title | text NOT NULL | |
| description | text | DEFAULT '' |
| type | text | 'bug' \| 'suggestion' \| 'question' |
| urgency | text | 'critical' \| 'high' \| 'normal' \| 'low' |
| status | text | 'open' \| 'in_progress' \| 'resolved' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### project_budget_plans
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| total_budget | bigint | 총 예산 |
| currency | text | DEFAULT 'KRW' |
| items | jsonb | 예산 항목 배열 (category, label, min_amount, max_amount, weight) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### project_clippings (보도자료·외부 링크 아카이빙)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| url | text NOT NULL | 원문 링크 |
| title | text | 기사/콘텐츠 제목 |
| description | text | 요약 설명 |
| thumbnail_url | text | og:image 등 |
| source | text | 매체명 (og:site_name 등) |
| published_at | timestamptz | 발행일 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### project_deliverables (산출물 — 소셜미디어 콘텐츠)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| platform | text | 'instagram' \| 'youtube' \| 'tiktok' \| 'twitter' \| 'facebook' \| 'blog' \| 'other' |
| url | text NOT NULL | 콘텐츠 원문 링크 |
| title | text | 콘텐츠 제목 |
| thumbnail_url | text | 썸네일 이미지 URL |
| channel_name | text | 채널/계정명 |
| published_at | timestamptz | 게시일 |
| views | bigint | 조회수 |
| likes | bigint | 좋아요 수 |
| comments | bigint | 댓글 수 |
| shares | bigint | 공유 수 |
| last_synced_at | timestamptz | 최근 지표 갱신 시각 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## RLS 정책 (anon 롤)

```sql
-- projects (전체 허용 → Auth 이후 소유자 제한)
CREATE POLICY anon_select_projects ON projects FOR SELECT TO anon USING (true);
CREATE POLICY auth_insert_projects ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY auth_update_projects ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY auth_delete_projects ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- form_fields
CREATE POLICY anon_select_form_fields ON form_fields FOR SELECT TO anon USING (true);
CREATE POLICY auth_insert_form_fields ON form_fields FOR INSERT TO authenticated
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY auth_delete_form_fields ON form_fields FOR DELETE TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- submissions
CREATE POLICY anon_insert_submissions ON submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY auth_select_submissions ON submissions FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- project_milestones, project_issues, project_members
-- auth_all_xxx: authenticated에 대해 USING/WITH CHECK 모두 project 소유자 검증
```

## Storage
- 버킷명: `banners` (public)
- 배너 경로: `project-banners/{uuid}.{ext}` → `uploadBanner(supabase, file)`
- 이미지 필드 경로: `field-images/{uuid}.{ext}` → `uploadFieldImage(supabase, file)`
- 썸네일 경로: `thumbnails/{uuid}.{ext}` → `uploadThumbnail(supabase, file)`
- 사이트 에셋 경로: `site-assets/og-image-{uuid}.{ext}` / `site-assets/favicon-{uuid}.{ext}` → `uploadSiteAsset(supabase, file, type)`

---

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## 마이그레이션 히스토리

| # | 내용 |
|---|---|
| 1~5 | 초기 필드 타입 확장 (options, content 컬럼 추가, CHECK 확장) |
| 6 | is_published, deadline, max_submissions 추가 |
| 7 | webhook_url 추가, Auth RLS 전환, set_user_id 트리거 |
| 8 | submission_message, table 타입 추가 |
| 9 | admin_email_template, user_email_template 추가 |
| 10 | thumbnail_url, locale_settings 추가 |
| 11 | form_fields.description 추가 |
| 12 | seo_title, seo_description, seo_og_image 추가 |
| 13 | form_fields.logic jsonb 추가 |
| 14 | form_fields CHECK — section, rating 추가 |
| 15 | announcements 테이블 생성 |
| 16 | release_notes 테이블 생성 |
| 17 | category, start_date, end_date, budget + project_members 테이블 |
| 18 | project_milestones 테이블 (간트 차트) |
| 19 | project_issues 테이블 (이슈 트래커) |
| 20 | project_budget_plans 테이블 (예산 계획) |
| 21 | project_clippings 테이블 (보도자료 아카이빙) |
| 22 | project_deliverables 테이블 (산출물 소셜 지표) |

```sql
-- 마이그레이션 20: 예산 계획
CREATE TABLE IF NOT EXISTS project_budget_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  total_budget bigint,
  currency text DEFAULT 'KRW',
  items jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 마이그레이션 21: 클리핑
CREATE TABLE IF NOT EXISTS project_clippings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  description text,
  thumbnail_url text,
  source text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 마이그레이션 22: 결과물(산출물)
CREATE TABLE IF NOT EXISTS project_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform text,
  url text NOT NULL,
  title text,
  thumbnail_url text,
  channel_name text,
  published_at timestamptz,
  views bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```
