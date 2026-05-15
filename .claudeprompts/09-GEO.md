# Project: GEO/AEO Competitive Intelligence 

## 1. 개요 (Overview)
본 프로젝트는 클래시스 볼뉴머의 주요 경쟁 브랜드(써마지, 덴서티, 올리지오, 텐써마, XERF)의 2026년 최신 GEO/AEO 최적화 상태를 실시간으로 추적하고, 데일리 PDF 리포트를 생성하는 상세 페이지 구축을 목표로 함.

- **대상 URL:** /geo
- **주요 목적:** AI 모델(ChatGPT, Gemini, Claude 등)이 답변을 생성할 때 자사 브랜드가 우선순위에 노출되도록 경쟁사의 전략을 분석하고 대응함.

---

## 2. 데이터 분석 및 수집 범위 (Scoping)
모든 데이터는 **2025년 대비 2026년 최신 데이터**에 한하며, 단순 검색 결과가 아닌 '최적화 활동'으로 판단되는 고품질 데이터만 추출함.

### Phase 1: On-Page 기술 최적화 (Technical SEO/AEO)
- 대상: 경쟁사 5개 브랜드 공식 홈페이지
- 체크 항목: 
    - Schema Markup (JSON-LD) 적용 여부 및 FAQ 구조화 데이터 분석
    - Q&A 콘텐츠의 E-E-A-T(전문성, 경험, 권위성, 신뢰성) 지표 점검
    - Core Web Vitals 및 모바일 최적화 상태

### Phase 2: 지식 소스 엔트리 (Authority Sources)
- 대상: Wikipedia, 나무위키, 주요 백과사전
- 체크 항목: 브랜드 개별 문서 존재 여부, 최근 업데이트 일자, 인용된 출처의 신뢰도

### Phase 3: AI 답변 점검 (AEO Benchmarking)
- 대상: Google AI Overview (SGE), Perplexity, ChatGPT (Search)
- 체크 항목: "리프팅 시술 추천", "모노폴라 RF 비교" 등의 키워드 검색 시 경쟁사 노출 빈도 및 답변 톤앤매너

### Phase 4: 커뮤니티 및 소셜 미디어 (Community Signals)
- 대상: 뷰티/성형 커뮤니티(바비톡, 강남언니 등), 블로그, 유튜브
- 체크 항목: 최신 콘텐츠 발행 빈도, 브랜드 언급량(Share of Voice), 긍/부정 키워드 클러스터링

### Phase 5: 미디어 및 학술 데이터 (Earned Media)
- 대상: 보도자료, 의학 학술 논문, 세미나 발표 자료
- 체크 항목: GEO 알고리즘이 신뢰할 수 있는 외부 인용(Citations) 증가 추이

---

## 3. UI/UX 디자인 가이드라인 (Front-end)

### 레이아웃 및 인터랙션
- **Grid Card News Layout:** 모든 데이터는 시각적 썸네일과 요약 텍스트가 포함된 카드 형태로 배치.
- **Tabbed Interface:** 브랜드별(써마지, 덴서티 등) 또는 분석 카테고리별(Tech, Media, Community) 탭 전환 기능.
- **Visual Elements:** 데이터 가독성을 위해 차트, 스코어링 인디케이터, 최신 콘텐츠 썸네일/동영상 임베딩 활용.

### 주요 기능
- **Daily PDF Export:** 대시보드 데이터를 요약하여 PDF 리포트로 즉시 저장/발송하는 기능.
- **Link Integrity:** 모든 출처는 원문 하이퍼링크를 연결하되, API를 통해 404 에러 여부를 사전 필터링하여 유효한 링크만 노출.

---

## 4. 기술적 요구 사항 (Technical Stack Suggestion)

### Data Fetching & Monitoring
- **Web Scraping/API:** BeautifulSoup, Playwright 등을 활용한 실시간 크롤링 및 Google Search API 연동.
- **AI Analysis:** LLM(Claude/GPT API)을 활용하여 수집된 원문 데이터의 AEO 최적화 점수 산출 및 요약.

### Dashboard Component (React/Tailwind 예시)
- `BrandTabNavigator`: 경쟁 브랜드 선택 탭.
- `AEO_ScoreCard`: AI 답변 노출 우선순위를 시각화한 차트.
- `ContentGrid`: 썸네일이 포함된 카드 뉴스 리스트.
- `ReportGenerator`: PDF 생성 로직 (jsPDF 또는 서버 사이드 렌더링 라이브러리).

---

## 5. 최종 결과물 예시 (Output Requirement)
1. **[Scraping Logic]:** 2026년 최신 정보를 필터링하여 가져오는 Python/Node.js 로직.
2. **[PDF Template]:** 데일리 리포트용 정형화된 레이아웃 디자인.

## 6. 향후 업데이트

### ✅ 구현 완료

| 항목 | 일자 | 내용 |
|---|---|---|
| Overview 탭 신설 | 2026-05-15 | 볼뉴머 GEO 종합 점수, 경쟁 순위, 차원별 격차 분석, 전략 액션 플랜, 전 브랜드 히트맵 포함 |
| AI 벤치마크 쿼리 CRUD | 2026-05-15 | 측정 쿼리 추가·수정·삭제 가능한 인터랙티브 테이블 구현 |
| 브랜드 확장 | 2026-05-15 | 울쎄라(Merz Aesthetics), 슈링크유니버스(루트로닉) 추가 → 총 8개 브랜드 |
| 볼뉴머 당사 기준 설정 | 2026-05-15 | 볼뉴머를 첫 번째(base brand)로 배치, 「당사」 배지 표기, 빨간 강조 스타일 |
| 브랜드 색상 시스템 | 2026-05-15 | 블루베리 컴포넌트의 BRAND_COLORS 기반 브랜드별 고유 컬러 적용 |
| GEO Playground 분리 | 2026-05-15 | 3-Tab 구조(Overview / 브랜드 분석 / GEO Playground)로 전체 영역 독립 사용 |
| 전문 리포트 레이아웃 | 2026-05-15 | 이모지 전면 제거, 최소 15px(text-base) 타이포그래피, 슬레이트 팔레트 기반 |
| Recharts 시각화 | 2026-05-15 | 수평 BarChart(순위·SoV), 그룹 BarChart(차원 격차·미디어), Donut PieChart(감성) |
| GEO Playground 실제 AI API 연동 | 2026-05-15 | ChatGPT(GPT-4o) · Gemini(1.5 Pro) · Claude(Sonnet) 3개 모델 병렬 실제 API 호출, Claude가 3개 답변 종합 GEO 분석 |
| YouTube 커뮤니티 콘텐츠 | 2026-05-15 | YouTube Data API v3 연동, 브랜드별 youtube_query 기반 최신 영상 6개 썸네일 그리드 표시 |
| PDF 내보내기 정식 구현 | 2026-05-15 | html-to-image + jsPDF 기반 A4 멀티페이지 PDF 저장(`GEO_분석_{브랜드명}_{날짜}.pdf`) |
| 학술 인용 링크 연결 | 2026-05-15 | EarnedMedia 탭 notable_citations에 url 필드 있을 경우 외부 링크로 클릭 가능 |
| 네이버 블로그·뉴스 실콘텐츠 | 2026-05-15 | Vercel Cron(매일 03:00 KST) → Naver Search API → Supabase geo_community_cache, 커뮤니티·미디어 탭 표시 |
| Supabase 스코어 스냅샷 DB | 2026-05-15 | geo_score_snapshots 테이블, Vercel Cron(매일 02:00 KST) 자동 저장 |
| 30일 GEO 트렌드 차트 | 2026-05-15 | 브랜드 분석 뷰 ScoreOverview 하단에 LineChart 추가, Supabase 히스토리 기반 |
| 주간 GEO 알림 이메일 | 2026-05-15 | Vercel Cron(매주 월요일 09:00 KST) → 7일 전 대비 ±5pts 이상 변동 브랜드 Resend 이메일 발송 |

---

### 📋 예정 업데이트

#### ~~[HIGH] GEO Playground — 실제 AI API 직접 연동~~ ✅ 완료
#### ~~[HIGH] 브랜드 분석 — 커뮤니티·미디어 실콘텐츠 연동~~ ✅ 완료 (YouTube + 네이버 블로그/뉴스)
#### ~~[MEDIUM] PDF 리포트 내보내기 정식 구현~~ ✅ 완료
#### ~~[MEDIUM] 데이터 실시간화 — Supabase 연동 + 트렌드 차트~~ ✅ 완료
#### ~~[LOW] 알림 기능 — 이메일 주간 리포트~~ ✅ 완료

#### [PENDING] 커뮤니티 — 바비톡·강남언니 실콘텐츠
- **현황:** 네이버 블로그/뉴스 연동 완료. 바비톡·강남언니는 공개 API 없어 Playwright 필요
- **조건:** 별도 스크래핑 인프라(Playwright Worker or Apify) 구축 후 진행
- **우선순위 낮음** — 네이버 블로그로 실제 커뮤니티 게시물 대부분 커버 가능

#### [PENDING] 데이터 완전 실시간화
- **현황:** Supabase 테이블 + Cron 구조 완성. 단, GEO 점수는 여전히 geo-data.ts Mock 값 기반
- **조건:** 경쟁사 사이트 크롤링 파이프라인 구축 후 DB 값으로 완전 대체

---
**주의사항:** 
- 모든 정보는 실시간성을 유지해야 함.
- 경쟁사 브랜드 홈페이지의 접근 차단(Bot detection)을 우회할 수 있는 안정적인 크롤링 방식을 고려할 것.
- 링크 연결 시 반드시 리다이렉션 오류 및 만료된 페이지를 체크하는 유효성 검사 로직을 포함할 것.