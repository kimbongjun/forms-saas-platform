# 블루베리 — 키워드 인사이트 메뉴

> 최초 작성: 2026-04-07  
> 위치: Aside 사이드바 하단 (WORKSPACE_HUBS 세 번째)

---

## 개요

블랙키위(blackkiwi.net)를 모방한 키워드 검색 인사이트 도구.  
키워드를 입력하면 **기간별 검색량 · 콘텐츠 발행량 · 플랫폼 언급량** 을 시각화한다.

---

## 파일 구조

```
src/
├── app/
│   └── blueberry/
│       ├── layout.tsx              ← WorkspaceShell 래퍼
│       ├── page.tsx                ← 메타데이터 + BlueberryClient 마운트
│       └── _components/
│           └── BlueberryClient.tsx ← 모든 UI / 상태 (Client Component)
├── constants/
│   └── ia.ts                       ← WORKSPACE_HUBS에 'blueberry' 추가
└── components/workspace/
    └── WorkspaceSidebar.tsx        ← Grape 아이콘 + HUB_ICONS['blueberry'] 추가
```

---

## 라우팅

| 경로 | 설명 |
|---|---|
| `/blueberry` | 키워드 인사이트 메인 |

---

## UI 구조

```
[키워드 입력창]  [분석하기 버튼]

[Naver 탭] [Google 탭]          [막대 | 선형 차트 전환]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 월간 검색량  │ │ 콘텐츠 발행량 │ │ 플랫폼 언급량 │
│   숫자 KPI  │ │  숫자 KPI   │ │  숫자 KPI   │
│  ▲ % MoM   │ │  ▲ % MoM   │ │  ▲ % MoM   │
└─────────────┘ └─────────────┘ └─────────────┘

[ 검색량 추이 — 12개월 SVG 차트 ]

[ 콘텐츠 발행량 차트 ]  [ 플랫폼별 언급량 수평 바 ]

[ 연관 키워드 테이블 — 키워드 / 검색량 / 경쟁도 ]
```

---

## 데이터 처리 방식

### Naver 탭
- **실 API 연동**: Naver 검색광고 API (`/api/blueberry/naver`) → 실측 월간 검색량(PC+모바일)
- **Mock 폴백**: API 미설정 시 `hashStr(keyword)` 시드 기반 결정론적 Mock 데이터
- 플랫폼 분류: 블로그·카페·뉴스·지식iN·쇼핑

### Google 탭
- **결정론적 Mock 데이터**: `hashStr(keyword + 'google')` 시드 기반
- 플랫폼 분류: 웹사이트·뉴스·유튜브·이미지·Reddit
- 연관 키워드 접미어: review·best·price·how to 등

### Naver DataLab (`/blueberry/datalab/`)
- **실 API 연동**: Naver DataLab 검색 트렌드 API
- 키워드 그룹, 기간·디바이스·성별·연령 필터 설정 가능

---

## 구현 완료 기능 (2026-04-09 기준)

| 기능 | 상태 |
|---|:---:|
| 복수 키워드 비교 차트 (최대 5개) | ✅ |
| 기간 필터 (1/3/6/12개월) | ✅ |
| CSV Export | ✅ |
| 브랜드별 지정 색상 팔레트 | ✅ |
| Naver 검색광고 API 실 연동 | ✅ |
| DataLab API 연동 (`/datalab`) | ✅ |
| 검색량 계절성 분석 (YoY) | ⬜ |
| 키워드 저장 / 모아보기 | ✅ |
| PDF/PNG 리포트 내보내기 | ✅ |
| Google Trends 실 연동 | ✅ |

---

## 환경변수

```bash
# Naver DataLab (검색 트렌드)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Naver 검색광고 API (실측 검색량)
NAVER_AD_API_KEY=
NAVER_AD_SECRET=
NAVER_AD_CUSTOMER_ID=
```

---

## 사이드바 연결

`src/constants/ia.ts` — `WORKSPACE_HUBS` 배열에 추가됨:

```typescript
{
  key: 'blueberry',
  href: '/blueberry',
  label: '블루베리',
  description: '키워드 검색 인사이트',
}
```

`WorkspaceSidebar.tsx` — `HUB_ICONS`에 `blueberry: Grape` 매핑.  
활성 상태 감지: `/blueberry` 또는 `/blueberry/*` 경로에서 자동 하이라이트.


## 향후 개선 계획

- 검색량 계절성 분석 (YoY)
- ~~키워드 저장 / 모아보기 기능~~ ✅ (localStorage, 검색창 아래 칩 UI)
- ~~PDF/PNG 리포트 내보내기~~ ✅ (html2canvas, PNG 다운로드)
- ~~Google Trends 비공식 API 연동~~ ✅ (`/api/blueberry/google`, `google-trends-api` npm)