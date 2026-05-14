# 시장조사 (Market Intelligence) 페이지 — 설계 문서

**작성일:** 2026-05-14  
**Phase:** 1 (MVP)  
**참조 스펙:** `.claudeprompts/08-Market-Report.md`

---

## 1. 개요

클래시스 마케팅본부 내부용 경쟁사 인텔리전스 대시보드.  
국내외 경쟁사 포지셔닝·제품 스펙·매출 추이를 필터 기반으로 탐색한다.  
Phase 1은 정적 데이터(TypeScript 파일)로 동작하며, Phase 3에서 DB/CMS로 전환 예정.

---

## 2. 파일 구조

```
src/app/market/
├── layout.tsx                    # WorkspaceShell + requireAuth
├── page.tsx                      # Server Component (metadata)
└── _components/
    ├── MarketClient.tsx           # 필터 상태 + 탭 오케스트레이터 ('use client')
    ├── CompetitorCard.tsx         # 카드 단위 컴포넌트
    ├── CompetitorModal.tsx        # 상세 모달 (재무 차트 포함)
    ├── PositioningMap.tsx         # Recharts ScatterChart (dynamic import, ssr:false)
    └── SpecTable.tsx              # 스펙 비교 테이블

src/app/market/_data/
└── competitors.ts                # 타입 정의 + 정적 경쟁사 데이터 (13개사)

src/constants/ia.ts               # WORKSPACE_HUBS에 market 항목 재추가
```

---

## 3. 데이터 모델

```typescript
type Region = 'Korea' | 'NA' | 'EU' | 'China' | 'SEA' | 'Others'
type DeviceCategory = 'HIFU' | 'RF' | 'NeedleRF' | 'Laser' | 'Body' | 'Injection' | 'Combo'
type Tier = 'Tier1' | 'Tier2' | 'Emerging'
type PriceTier = 'Premium' | 'Mid' | 'Value'
type EventType = 'Launch' | 'MA' | 'Partnership' | 'Clinical' | 'Award' | 'Other'
type DataSource = 'DART 공시' | 'SEC 공시' | '업계추정' | 'IR 보고서'

interface Competitor {
  competitor_id: string
  company_name: string
  company_name_ko?: string
  hq_country: string
  hq_flag: string
  tier: Tier
  is_classys?: boolean
  color: string                   // 차트·강조색
  description: string
  markets: Region[]
  device_categories: DeviceCategory[]
  positioning: {
    price_score: number           // 1(Value) ~ 10(Premium)
    tech_score: number            // 1(Low) ~ 10(High complexity)
    revenue_m: number             // 버블 크기 기준 (USD 백만)
  }
  products: Product[]
  financials: Financial[]
  events: CompEvent[]
}

interface Product {
  product_name: string
  category: DeviceCategory
  launch_year: number
  price_tier: PriceTier
  certifications: string[]        // 'FDA' | 'CE' | 'KFDA' 등
  specs: {
    energy_type?: string
    handpieces?: number
    indications?: string[]
    depth_mm?: number[]
    wavelength_nm?: number[]
    notes?: string
  }
}

interface Financial {
  year: number
  revenue_usd_m: number
  source: DataSource
}

interface CompEvent {
  date: string                    // 'YYYY-MM'
  type: EventType
  description: string
}
```

### 사전 입력 경쟁사 13개

| 회사 | 국가 | 티어 | 주력 카테고리 | 매출(추정) | 데이터 출처 |
|------|------|------|------------|---------|-----------|
| Classys (자사) | 🇰🇷 | Tier1 | HIFU, NeedleRF, Body | $285M | DART 공시 |
| InMode | 🇮🇱 | Tier1 | RF, NeedleRF, Body | $448M | SEC 공시 |
| Solta Medical | 🇺🇸 | Tier1 | HIFU, RF, Laser | $210M | 업계추정 |
| Alma Lasers | 🇮🇱 | Tier1 | Laser, RF, HIFU, Combo | $180M | 업계추정 |
| Syneron-Candela | 🇮🇱 | Tier1 | RF, Laser | $240M | 업계추정 |
| Merz Aesthetics | 🇩🇪 | Tier1 | HIFU, Injection | $320M | IR 보고서 |
| Cutera | 🇺🇸 | Tier2 | Laser, RF, Body | $118M | SEC 공시 |
| VIOL (비올) | 🇰🇷 | Tier2 | NeedleRF | $55M | DART 공시 |
| Lutronic (루트로닉) | 🇰🇷 | Tier2 | Laser, NeedleRF | $110M | DART 공시 |
| Jeisys (제이시스) | 🇰🇷 | Tier2 | HIFU, Laser, RF | $82M | DART 공시 |
| Wontech (원텍) | 🇰🇷 | Tier2 | Laser, HIFU | $63M | DART 공시 |
| Hironic (하이로닉) | 🇰🇷 | Tier2 | HIFU, RF | $52M | DART 공시 |
| Asterasys (아스테라시스) | 🇰🇷 | Emerging | NeedleRF, RF | $28M | 업계추정 |

---

## 4. 필터 & 상태 관리

### 필터 3종 (복수 선택, 미선택 = 전체)

- **지역:** Korea / NA / EU / China / SEA / Others
- **기기 카테고리:** HIFU / RF / NeedleRF / Laser / Body / Injection / Combo
- **티어:** Tier1 / Tier2 / Emerging

### 매칭 로직

```typescript
isMatch(c: Competitor): boolean {
  if (c.is_classys) return true  // 항상 매칭
  const regionOk  = regions.size === 0 || c.markets.some(m => regions.has(m))
  const catOk     = categories.size === 0 || c.device_categories.some(d => categories.has(d))
  const tierOk    = tiers.size === 0 || tiers.has(c.tier)
  return regionOk && catOk && tierOk
}
```

### 비매칭 처리

- 카드: `opacity-40 pointer-events-none` (클릭 불가)
- 포지셔닝 맵 버블: `opacity-15`
- 스펙 테이블 행: `opacity-30`
- 클래시스: 항상 첫 번째, 파란 테두리·배경 유지

---

## 5. Module A — 경쟁사 카드

### 카드 레이아웃

```
┌─────────────────────────────────┐
│ 🇰🇷 Classys           [Tier1]  │
│ 클래시스                        │
│ ─────────────────────────────── │
│ [HIFU] [NeedleRF] [Body]        │
│ 시장: Korea · EU · SEA 외       │
│                       $285M ↗   │
└─────────────────────────────────┘
```

- Classys: `border-blue-500 bg-blue-50` 강조
- 티어 배지: Tier1 보라 / Tier2 파랑 / Emerging 초록
- 그리드: 기본 3열, 태블릿 2열, 모바일 1열

### 모달 (클릭 시 중앙 팝업)

```
┌────────────────────────────────────────┐
│ 🇰🇷 Classys  [Tier1]           [✕]   │
│ 국내 HIFU·NeedleRF 선도 기업           │
├──────────────────┬─────────────────────┤
│ 진출 시장 칩     │ 매출 추이 라인차트  │
│ 기기 카테고리 칩 │ Recharts LineChart  │
│                  │ (2020–2024)         │
├──────────────────┴─────────────────────┤
│ 제품 목록                              │
│  · Ultraformer III — HIFU, 2017, FDA   │
│  · Volnewmer — NeedleRF, 2021, CE      │
├────────────────────────────────────────┤
│ 주요 이벤트 (최근 4건)                 │
│  2024-03 🚀 KIMES 2024 참가            │
│  2023-10 🚀 Ultraformer MPT 출시       │
└────────────────────────────────────────┘
```

- 모달 최대 너비: `max-w-3xl`
- 배경: `backdrop-blur-sm bg-black/40`
- 재무 차트 데이터 출처 표시 (공시/추정 구분)

---

## 6. Module B — 포지셔닝 맵

**Recharts ScatterChart (`dynamic(..., { ssr: false })`)**

| 항목 | 내용 |
|------|------|
| X축 | 가격 포지셔닝 1→10 (Value → Premium) |
| Y축 | 기술 복잡도 1→10 (Low → High) |
| 버블 크기 | 매출 비례 (min 20 ~ max 60px radius) |
| Classys | 파란색, 레이블 항상 표시, z-index 최상위 |
| 비매칭 | `opacity-15` |
| 툴팁 | 회사명, 매출 $M, 가격/기술 점수 |

**사분면 레이블 (배경 텍스트):**
- 좌상: "고기술 / 가성비"
- 우상: "프리미엄 혁신 (Classys 영역)"
- 좌하: "보급형"
- 우하: "고가 레거시"

---

## 7. Module D — 스펙 비교 테이블

**카테고리 탭 (선택 시 해당 제품만 표시):**
```
[HIFU] [RF] [NeedleRF] [Laser] [Body] [Injection] [Combo]
```

**컬럼:**

| 회사 | 제품명 | 출시연도 | 가격티어 | 에너지 유형 | 주요 적응증 | FDA | CE | KFDA |
|------|--------|---------|---------|----------|-----------|-----|----|----|

- Classys 행: `bg-blue-50` + `font-semibold` 상단 고정
- 컬럼 헤더 클릭 시 정렬 (오름/내림차순 토글)
- 필터 비매칭 회사 행: `opacity-30`
- 인증 여부: ✓ / — 표시
- 빈 스펙 항목: `—` 표시

---

## 8. 네비게이션 통합

`src/constants/ia.ts`의 `WORKSPACE_HUBS` 배열에 추가:
```typescript
{
  key: 'market',
  href: '/market',
  label: '시장조사',
  description: '경쟁사 인텔리전스 대시보드',
}
```
`WorkspaceHub` 유니언 타입에도 `'market'` 추가.

---

## 9. UX 규칙 (스펙 2-3절 기반)

| 항목 | 구현 방식 |
|------|---------|
| 필터 전환 애니메이션 | Tailwind `transition-opacity duration-300` |
| 클래시스 고정 | `isMatch()` 항상 true, 카드 첫 번째, 맵 z-index 최상위 |
| 데이터 출처 표시 | 재무 차트 하단 `source` 필드 텍스트 표기 |
| 반응형 | 태블릿(768px) 이상 필수 대응 |
| 데이터 보안 | `WorkspaceShell requireAuth` (Phase 1 기본 인증) |

---

## 10. Phase 범위

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 (현재) | 필터 + Module A + Module B + Module D | **구현 대상** |
| Phase 2 | Module C(매출 트렌드 차트), Module E(타임라인), 내보내기 | 추후 |
| Phase 3 | Module F(인사이트), DB/CMS 연동, 관리자 입력 UI | 추후 |
