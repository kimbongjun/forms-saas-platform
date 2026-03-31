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
| user_id | uuid | 추후 인증용 (현재 미사용) |
| created_at | timestamptz | now() |

### form_fields
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| label | text | 필드 제목 |
| type | text CHECK | FieldType 10종 참조 |
| required | boolean | |
| order_index | int | DnD 순서 |
| options | jsonb | select/radio/checkbox_group 선택지 배열 |
| content | text | html(WYSIWYG HTML), map/youtube URL, text_block 텍스트, image URL |
| created_at | timestamptz | |

**FieldType CHECK:**
`'text','email','textarea','checkbox','select','radio','checkbox_group','html','map','youtube','text_block','image','divider'`

### submissions
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects ON DELETE CASCADE |
| answers | jsonb NOT NULL | `{fieldId: string \| boolean \| string[]}` |
| created_at | timestamptz | |

---

## RLS 정책 (anon 롤)

```sql
-- projects (전체 허용)
CREATE POLICY anon_select_projects ON projects FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_projects ON projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_projects ON projects FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_projects ON projects FOR DELETE TO anon USING (true);

-- form_fields
CREATE POLICY anon_select_form_fields ON form_fields FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_form_fields ON form_fields FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_delete_form_fields ON form_fields FOR DELETE TO anon USING (true);

-- submissions
CREATE POLICY anon_insert_submissions ON submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_select_submissions ON submissions FOR SELECT TO anon USING (true);
```

## Storage
- 버킷명: `banners` (public)
- 업로드 경로: `project-banners/{uuid}.{ext}`
- 업로드 함수: `src/utils/supabase/storage.ts` → `uploadBanner(supabase, file): Promise<string>`

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev   # 도메인 인증 후 변경
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key  # 지도 필드 Places Autocomplete용 (선택)
```

## 마이그레이션 히스토리
1. 초기 4개 타입 → `options(jsonb)`, `content(text)` 컬럼 추가
2. CHECK 제약 확장 → html, select, radio, checkbox_group 추가
3. CHECK 재확장 → map, youtube 추가
4. `notification_email`, `theme_color` 컬럼 추가 (ALTER TABLE ADD COLUMN IF NOT EXISTS)
5. CHECK 재확장 → text_block, image, divider 추가
