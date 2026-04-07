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
| html | 꾸밈 | ✅ HTML | - | TinyMCE WYSIWYG |
| text_block | 꾸밈 | ✅ 텍스트 | - | 평문 단락 |
| image | 꾸밈 | ✅ URL | - | 이미지+캡션 |
| divider | 꾸밈 | - | - | 수평선 |
| map | 꾸밈 | ✅ embed URL | - | Google Maps iframe |
| youtube | 꾸밈 | ✅ 영상 URL | - | YouTube 반응형 |
| table | 꾸밈 | ✅ JSON | - | 행/열 테이블 |

---

## API 라우트 전체 목록

### 폼 & 프로젝트 기본
| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/projects` | 폼 생성 | 로그인 |
| PUT | `/api/projects/[id]` | 폼 수정 + 필드 저장 | 소유자 |
| POST | `/api/duplicate` | 폼 복제 (비공개 상태) | 소유자 |
| POST | `/api/submit` | 공개 폼 제출 | anon |
| GET | `/api/site-logo` | 사이트 로고 (다크모드) | — |

### 예산 관리
| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/projects/[id]/budget` | 예산 조회 | 소유자 |
| PUT | `/api/projects/[id]/budget` | 예산 저장 | 소유자 |

### 클리핑 (보도자료·외부 링크)
| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/projects/[id]/clippings` | 클리핑 목록 조회 | 소유자 |
| POST | `/api/projects/[id]/clippings` | 클리핑 생성 | 소유자 |
| POST | `/api/projects/[id]/clippings/parse` | URL 메타데이터 자동 파싱 | 소유자 |
| POST | `/api/projects/[id]/clippings/search` | 클리핑 검색 | 소유자 |
| POST | `/api/projects/[id]/clippings/bulk` | 대량 클리핑 추가 | 소유자 |
| PUT | `/api/projects/[id]/clippings/[clippingId]` | 클리핑 수정 | 소유자 |
| DELETE | `/api/projects/[id]/clippings/[clippingId]` | 클리핑 삭제 | 소유자 |

### 결과물 (산출물·소셜 지표)
| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/projects/[id]/deliverables` | 결과물 목록 조회 | 소유자 |
| POST | `/api/projects/[id]/deliverables` | 결과물 생성 | 소유자 |
| POST | `/api/projects/[id]/deliverables/parse` | 소셜미디어 데이터 파싱 | 소유자 |
| POST | `/api/projects/[id]/deliverables/search` | 결과물 검색 | 소유자 |
| POST | `/api/projects/[id]/deliverables/bulk` | 대량 결과물 추가 | 소유자 |
| PUT | `/api/projects/[id]/deliverables/[deliverableId]` | 결과물 수정 | 소유자 |
| DELETE | `/api/projects/[id]/deliverables/[deliverableId]` | 결과물 삭제 | 소유자 |

### 마일스톤 & 이슈
| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/projects/[id]/milestones` | 마일스톤 목록 | 소유자 |
| POST | `/api/projects/[id]/milestones` | 마일스톤 생성 | 소유자 |
| PUT | `/api/projects/[id]/milestones` | 마일스톤 수정 | 소유자 |
| DELETE | `/api/projects/[id]/milestones` | 마일스톤 삭제 | 소유자 |
| GET | `/api/projects/[id]/issues` | 이슈 목록 | 소유자 |
| POST | `/api/projects/[id]/issues` | 이슈 생성 | 소유자 |
| PUT | `/api/projects/[id]/issues` | 이슈 수정 | 소유자 |
| DELETE | `/api/projects/[id]/issues` | 이슈 삭제 | 소유자 |

### 관리자
| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
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

### 응답 내보내기
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/dashboard/(main)/[id]/responses/export` | CSV 내보내기 |
| GET | `/projects/[id]/execution/live-responses/export` | CSV 내보내기 (워크스페이스) |

---

## 구현 완료 기능 요약

### 빌더
- 17가지 필드 타입, DnD 순서 변경 (@dnd-kit)
- 탭 구조: [편집] [설정] [응답] (BuilderTabBar)
- 다단계(section) + 진행바 + 다음/이전
- Conditional Logic: radio → 섹션 분기 (form_fields.logic jsonb)
- 테마 컬러 프리셋 8종 + 커스텀
- TinyMCE WYSIWYG (html 필드 타입, SSR 비활성화)

### 설정 탭 (SettingsPanel)
- 테마 컬러, 배너/썸네일 업로드
- 알림 이메일, 제출 완료 메시지
- 마감일(deadline), 최대 응답 수, 공개/비공개 토글
- 웹훅 URL (제출 시 JSON POST)
- 관리자·응답자 이메일 템플릿 (TinyMCE)
- 다국어 설정 (ko/en/ja/zh + 텍스트 오버라이드)
- SEO 설정 (seo_title, seo_description, seo_og_image)

### 공개 폼
- slug 기반 접근, 비공개/마감/최대응답 수 검사
- 다국어 언어 전환 버튼
- map URL 하위 호환 자동 변환

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

### 예산 관리 (BudgetPlanner)
- 예산 항목 추가/편집 (미디어, 제작, 운영, 인력, 장소 등 카테고리)
- 항목별 최소/최대 금액, 가중치 설정
- 총 예산 대비 배분 시각화
- project_budget_plans 테이블 저장/로드

### 산출물 관리 (Outputs — `/projects/[id]/outputs/`)
#### deliverables (소셜 콘텐츠 지표)
- URL 입력 시 플랫폼 자동 감지 (Instagram, YouTube, TikTok 등)
- 소셜 지표 자동 파싱 (조회수, 좋아요, 댓글, 공유)
- 플랫폼별 그룹 표시 (B2C 마케팅 / 인플루언서 마케팅)
- 썸네일, 채널명, 게시일 아카이빙
- 1시간 단위 자동 갱신 + 수동 새로고침 버튼
- 검색, 대량 추가 지원

#### clippings (보도자료·외부 링크)
- URL 입력 시 og:title, og:description, og:image, 발행일 자동 파싱
- 매체명, 기사 제목, 설명 편집
- 검색, 대량 추가 지원

### 인사이트 대시보드 (Insights — `/projects/[id]/insights/`)
- 핵심 성과 지표(KPI): 전체 조회/노출, 인게이지먼트, 보도자료 노출 합산
- 목표 달성률 시각화
- 주요 보도자료 및 클리핑 목록
- deliverables + clippings 데이터 집계

### 관리자
- 사용자 관리: 역할 변경, 비밀번호 초기화, 삭제
- 사이트 설정: SEO, OG 이미지, 파비콘, 약관 WYSIWYG
- 공지사항 / 릴리즈노트 CRUD + git 자동 생성

### 인프라
- Supabase Auth (middleware 보호), profiles.role 기반 권한
- `createPublicClient()`: 비인증 공개 폼 전용 (cache: 'no-store')
- Resend 이메일 (관리자 알림 + 응답자 확인)
- 색상 유틸: 명도 자동 조정, WCAG 대비 보장 (site-settings.ts)
