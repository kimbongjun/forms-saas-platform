# Market Intelligence 시장조사 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 클래시스 마케팅본부 전용 경쟁사 인텔리전스 대시보드 — 필터 기반 경쟁사 카드(A) + 포지셔닝 맵(B) + 스펙 비교 테이블(D) Phase 1 MVP 구현

**Architecture:** 정적 TypeScript 데이터 파일(`_data/competitors.ts`)을 단일 진실 공급원으로 사용. `MarketClient.tsx`가 필터 상태를 소유하고 탭별 모듈 컴포넌트에 `matchedIds` Set을 전달. `PositioningMap`은 SSR 이슈 방지를 위해 `dynamic(ssr:false)` 적용.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Recharts (기존 의존성), Lucide React

**Spec:** `docs/superpowers/specs/2026-05-14-market-intelligence-design.md`

---

## 파일 맵

| 작업 | 파일 | 역할 |
|------|------|------|
| Create | `src/app/market/_data/competitors.ts` | 타입 정의 + 13개사 정적 데이터 |
| Modify | `src/constants/ia.ts` | market 허브 재추가 |
| Create | `src/app/market/layout.tsx` | WorkspaceShell 래핑 |
| Create | `src/app/market/page.tsx` | Server Component + metadata |
| Create | `src/app/market/_components/CompetitorCard.tsx` | 카드 단위 컴포넌트 |
| Create | `src/app/market/_components/CompetitorModal.tsx` | 상세 모달 + 미니 재무 차트 |
| Create | `src/app/market/_components/PositioningMap.tsx` | Recharts ScatterChart |
| Create | `src/app/market/_components/SpecTable.tsx` | 스펙 비교 테이블 |
| Create | `src/app/market/_components/MarketClient.tsx` | 필터 상태 + 탭 오케스트레이터 |

---

## Task 1: 타입 정의 + 정적 경쟁사 데이터

**Files:**
- Create: `src/app/market/_data/competitors.ts`

- [ ] **Step 1: 디렉터리 생성 및 파일 작성**

`src/app/market/_data/competitors.ts` 전체 내용:

```typescript
// ── 타입 정의 ─────────────────────────────────────────────────────
export type Region = 'Korea' | 'NA' | 'EU' | 'China' | 'SEA' | 'Others'
export type DeviceCategory = 'HIFU' | 'RF' | 'NeedleRF' | 'Laser' | 'Body' | 'Injection' | 'Combo'
export type Tier = 'Tier1' | 'Tier2' | 'Emerging'
export type PriceTier = 'Premium' | 'Mid' | 'Value'
export type EventType = 'Launch' | 'MA' | 'Partnership' | 'Clinical' | 'Award' | 'Other'
export type DataSource = 'DART 공시' | 'SEC 공시' | '업계추정' | 'IR 보고서'

export interface Product {
  product_name: string
  category: DeviceCategory
  launch_year: number
  price_tier: PriceTier
  certifications: string[]
  specs: {
    energy_type?: string
    handpieces?: number
    indications?: string[]
    depth_mm?: number[]
    wavelength_nm?: number[]
    notes?: string
  }
}

export interface Financial {
  year: number
  revenue_usd_m: number
  source: DataSource
}

export interface CompEvent {
  date: string
  type: EventType
  description: string
}

export interface Competitor {
  competitor_id: string
  company_name: string
  company_name_ko?: string
  hq_country: string
  hq_flag: string
  tier: Tier
  is_classys?: boolean
  color: string
  description: string
  markets: Region[]
  device_categories: DeviceCategory[]
  positioning: {
    price_score: number
    tech_score: number
    revenue_m: number
  }
  products: Product[]
  financials: Financial[]
  events: CompEvent[]
}

// ── 정적 데이터 ──────────────────────────────────────────────────
export const COMPETITORS: Competitor[] = [
  // 1. Classys (자사) ────────────────────────────────────────────
  {
    competitor_id: 'classys',
    company_name: 'Classys',
    company_name_ko: '클래시스',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier1',
    is_classys: true,
    color: '#2563EB',
    description: '국내 HIFU·미세침RF 분야 선도 기업. Ultraformer 시리즈 및 Volnewmer 보유. KOSDAQ 상장.',
    markets: ['Korea', 'EU', 'China', 'SEA', 'Others'],
    device_categories: ['HIFU', 'NeedleRF', 'Body'],
    positioning: { price_score: 7.5, tech_score: 8.5, revenue_m: 285 },
    products: [
      {
        product_name: 'Ultraformer III',
        category: 'HIFU',
        launch_year: 2017,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'HIFU',
          handpieces: 5,
          indications: ['Lifting', 'Tightening', 'Body Contouring'],
          depth_mm: [1.5, 3.0, 4.5, 6.0, 9.0, 13.0],
        },
      },
      {
        product_name: 'Ultraformer MPT',
        category: 'HIFU',
        launch_year: 2023,
        price_tier: 'Premium',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'HIFU + Microfocused RF',
          handpieces: 7,
          indications: ['Lifting', 'Tightening', 'Skin Tone', 'Body'],
          depth_mm: [1.5, 2.0, 3.0, 4.5, 6.0, 9.0, 13.0],
        },
      },
      {
        product_name: 'Volnewmer',
        category: 'NeedleRF',
        launch_year: 2021,
        price_tier: 'Premium',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Microneedle RF',
          indications: ['Skin Resurfacing', 'Pore Reduction', 'Acne Scar'],
          notes: '독점 폴리머 코팅 니들 기술',
        },
      },
      {
        product_name: 'SHURINK Universe',
        category: 'HIFU',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'HIFU',
          handpieces: 3,
          indications: ['Lifting', 'Tightening'],
          depth_mm: [2.0, 3.0, 4.5],
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 98,  source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 142, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 198, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 247, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 285, source: 'DART 공시' },
    ],
    events: [
      { date: '2023-10', type: 'Launch',      description: 'Ultraformer MPT 출시 (HIFU + Microfocused RF 복합)' },
      { date: '2024-01', type: 'Partnership', description: 'IMCAS Paris 2024 참가, 유럽 파트너십 확대' },
      { date: '2024-03', type: 'Launch',      description: 'KIMES 2024 — 신규 바디 라인 공개' },
      { date: '2024-06', type: 'Award',       description: '2024 대한피부과학회 우수 기업상 수상' },
    ],
  },

  // 2. InMode ────────────────────────────────────────────────────
  {
    competitor_id: 'inmode',
    company_name: 'InMode',
    hq_country: 'Israel / USA',
    hq_flag: '🇮🇱',
    tier: 'Tier1',
    color: '#7C3AED',
    description: 'NASDAQ 상장 RF 특화 기업. Morpheus8·FaceTite 등 미니멀 침습 RF 포트폴리오.',
    markets: ['NA', 'EU', 'Korea', 'SEA', 'Others'],
    device_categories: ['RF', 'NeedleRF', 'Body'],
    positioning: { price_score: 9.0, tech_score: 8.0, revenue_m: 448 },
    products: [
      {
        product_name: 'Morpheus8',
        category: 'NeedleRF',
        launch_year: 2018,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional Microneedle RF',
          indications: ['Skin Resurfacing', 'Body Remodeling', 'Scar'],
          notes: '24-핀 어레이, 최대 8mm 침투',
        },
      },
      {
        product_name: 'FaceTite',
        category: 'RF',
        launch_year: 2017,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'RFAL (Radio Frequency Assisted Lipolysis)',
          indications: ['Facial Contouring', 'Skin Tightening'],
          notes: '최소 침습 안면 윤곽 시술',
        },
      },
      {
        product_name: 'BodyTite',
        category: 'Body',
        launch_year: 2015,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'RFAL',
          indications: ['Body Contouring', 'Lipolysis', 'Skin Tightening'],
        },
      },
      {
        product_name: 'EvolveX',
        category: 'Body',
        launch_year: 2023,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'RF + EMS',
          indications: ['Body Remodeling', 'Muscle Tone', 'Fat Reduction'],
          notes: 'Hands-free 치료 플랫폼',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 221, source: 'SEC 공시' },
      { year: 2021, revenue_usd_m: 357, source: 'SEC 공시' },
      { year: 2022, revenue_usd_m: 453, source: 'SEC 공시' },
      { year: 2023, revenue_usd_m: 474, source: 'SEC 공시' },
      { year: 2024, revenue_usd_m: 448, source: 'SEC 공시' },
    ],
    events: [
      { date: '2022-11', type: 'Launch',   description: 'Morpheus8 Body 버전 FDA 승인' },
      { date: '2023-05', type: 'Launch',   description: 'EvolveX 플랫폼 전 세계 출시' },
      { date: '2024-02', type: 'Clinical', description: 'Morpheus8 임상 논문 200편 돌파 발표' },
      { date: '2024-09', type: 'Award',    description: 'Aesthetics Awards 2024 Best Energy Device 수상' },
    ],
  },

  // 3. Solta Medical ────────────────────────────────────────────
  {
    competitor_id: 'solta',
    company_name: 'Solta Medical',
    hq_country: 'USA',
    hq_flag: '🇺🇸',
    tier: 'Tier1',
    color: '#DC2626',
    description: 'Bausch Health 산하. Thermage·Fraxel 등 HIFU·레이저 기반 클래식 프리미엄 브랜드.',
    markets: ['NA', 'EU', 'Korea', 'China', 'SEA'],
    device_categories: ['RF', 'Laser', 'HIFU'],
    positioning: { price_score: 9.5, tech_score: 7.5, revenue_m: 210 },
    products: [
      {
        product_name: 'Thermage FLX',
        category: 'RF',
        launch_year: 2017,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Monopolar RF',
          indications: ['Tightening', 'Lifting', 'Body Contouring'],
          notes: '비침습 RF 타이트닝의 대명사, 1회 시술',
        },
      },
      {
        product_name: 'Fraxel',
        category: 'Laser',
        launch_year: 2004,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional Laser',
          wavelength_nm: [1550, 1927],
          indications: ['Skin Resurfacing', 'Scar', 'Pigmentation'],
        },
      },
      {
        product_name: 'Clear + Brilliant',
        category: 'Laser',
        launch_year: 2011,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional Laser',
          wavelength_nm: [1440, 1927],
          indications: ['Skin Tone', 'Texture', 'Prevention'],
          notes: '"Baby Fraxel" — 젊은 층 유지 관리용',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 145, source: '업계추정' },
      { year: 2021, revenue_usd_m: 172, source: '업계추정' },
      { year: 2022, revenue_usd_m: 195, source: '업계추정' },
      { year: 2023, revenue_usd_m: 210, source: '업계추정' },
      { year: 2024, revenue_usd_m: 218, source: '업계추정' },
    ],
    events: [
      { date: '2022-03', type: 'Launch',   description: 'Thermage FLX 5th Generation 팁 출시' },
      { date: '2023-06', type: 'Clinical', description: 'Thermage 20주년 기념 임상 리뷰 논문 발표' },
      { date: '2024-01', type: 'Partnership', description: 'IMCAS 2024 — 아시아 파트너 네트워크 확장' },
    ],
  },

  // 4. Alma Lasers ──────────────────────────────────────────────
  {
    competitor_id: 'alma',
    company_name: 'Alma Lasers',
    hq_country: 'Israel',
    hq_flag: '🇮🇱',
    tier: 'Tier1',
    color: '#059669',
    description: '최대 규모 멀티 기술 플랫폼. Soprano ICE·Harmony XL Pro·Accent Prime 등 40+ 치료 모드.',
    markets: ['EU', 'NA', 'Korea', 'China', 'SEA', 'Others'],
    device_categories: ['Laser', 'RF', 'HIFU', 'Body', 'Combo'],
    positioning: { price_score: 7.0, tech_score: 8.0, revenue_m: 180 },
    products: [
      {
        product_name: 'Soprano ICE Platinum',
        category: 'Laser',
        launch_year: 2016,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Diode Laser (SHR)',
          wavelength_nm: [755, 810, 1064],
          indications: ['Hair Removal', 'Skin Rejuvenation'],
          notes: 'In-Motion™ 테크놀로지, 통증 최소화',
        },
      },
      {
        product_name: 'Accent Prime',
        category: 'Body',
        launch_year: 2015,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Ultrasound + RF',
          indications: ['Body Contouring', 'Skin Tightening', 'Cellulite'],
        },
      },
      {
        product_name: 'Harmony XL Pro',
        category: 'Combo',
        launch_year: 2010,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Multi-technology (IPL, Laser, RF)',
          indications: ['Vascular', 'Pigmentation', 'Resurfacing', 'Hair Removal'],
          notes: '40+ 치료 모드 플랫폼',
        },
      },
      {
        product_name: 'Opus Plasma',
        category: 'Laser',
        launch_year: 2024,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional Plasma',
          indications: ['Skin Resurfacing', 'Tightening', 'Scar'],
          notes: '차세대 분획 플라즈마 기술',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 130, source: '업계추정' },
      { year: 2021, revenue_usd_m: 145, source: '업계추정' },
      { year: 2022, revenue_usd_m: 163, source: '업계추정' },
      { year: 2023, revenue_usd_m: 175, source: '업계추정' },
      { year: 2024, revenue_usd_m: 180, source: '업계추정' },
    ],
    events: [
      { date: '2023-01', type: 'Launch',      description: 'Soprano Titanium 출시 — 차세대 제모 플랫폼' },
      { date: '2023-09', type: 'Partnership', description: 'Sisram Medical 아시아 확장 전략 발표' },
      { date: '2024-03', type: 'Launch',      description: 'Opus Plasma+ 출시 — 분획 플라즈마 신기술' },
    ],
  },

  // 5. Syneron-Candela ──────────────────────────────────────────
  {
    competitor_id: 'syneron_candela',
    company_name: 'Syneron-Candela',
    hq_country: 'USA',
    hq_flag: '🇺🇸',
    tier: 'Tier1',
    color: '#0891B2',
    description: 'Apax Partners 소유. GentleMax Pro·Profound RF·CO2RE 등 레이저·RF 광범위 포트폴리오.',
    markets: ['NA', 'EU', 'Korea', 'SEA', 'Others'],
    device_categories: ['Laser', 'RF', 'NeedleRF'],
    positioning: { price_score: 8.0, tech_score: 7.5, revenue_m: 240 },
    products: [
      {
        product_name: 'GentleMax Pro Plus',
        category: 'Laser',
        launch_year: 2020,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Dual Wavelength Laser',
          wavelength_nm: [755, 1064],
          indications: ['Hair Removal', 'Vascular', 'Pigmentation'],
          notes: '다이나믹 쿨링 + 초대형 스팟 사이즈',
        },
      },
      {
        product_name: 'Profound RF',
        category: 'NeedleRF',
        launch_year: 2014,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Bipolar RF (Microneedle)',
          indications: ['Lifting', 'Tightening', 'Cellulite'],
          notes: '실시간 온도 제어 기술',
        },
      },
      {
        product_name: 'CO2RE',
        category: 'Laser',
        launch_year: 2012,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional CO2 Laser (10600nm)',
          wavelength_nm: [10600],
          indications: ['Skin Resurfacing', 'Scar', 'Wrinkle'],
          notes: 'Superficial·Mid·Deep 모드 동시 적용',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 185, source: '업계추정' },
      { year: 2021, revenue_usd_m: 210, source: '업계추정' },
      { year: 2022, revenue_usd_m: 228, source: '업계추정' },
      { year: 2023, revenue_usd_m: 240, source: '업계추정' },
      { year: 2024, revenue_usd_m: 245, source: '업계추정' },
    ],
    events: [
      { date: '2022-04', type: 'Launch',      description: 'GentleMax Pro Plus 출시 — 냉각 시스템 업그레이드' },
      { date: '2023-03', type: 'Partnership', description: '아시아태평양 유통 파트너 네트워크 재편' },
      { date: '2024-02', type: 'Clinical',    description: 'Profound RF 안면 리프팅 3년 추적 임상 결과 발표' },
    ],
  },

  // 6. Merz Aesthetics ─────────────────────────────────────────
  {
    competitor_id: 'merz',
    company_name: 'Merz Aesthetics',
    company_name_ko: '멀츠',
    hq_country: 'Germany',
    hq_flag: '🇩🇪',
    tier: 'Tier1',
    color: '#9333EA',
    description: '독일 Merz Pharma 산하. Ultherapy HIFU 및 Radiesse·Belotero 등 인젝터블 포트폴리오.',
    markets: ['EU', 'NA', 'Korea', 'China', 'SEA'],
    device_categories: ['HIFU', 'Injection'],
    positioning: { price_score: 9.0, tech_score: 7.0, revenue_m: 320 },
    products: [
      {
        product_name: 'Ultherapy',
        category: 'HIFU',
        launch_year: 2009,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-Focused Ultrasound (MFU-V)',
          handpieces: 4,
          indications: ['Brow Lifting', 'Neck Tightening', 'Décolletage'],
          depth_mm: [1.5, 3.0, 4.5, 6.0],
          notes: '최초 FDA 승인 비침습 리프팅 기기 (2009)',
        },
      },
      {
        product_name: 'Radiesse',
        category: 'Injection',
        launch_year: 2006,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'N/A',
          indications: ['Volume Restoration', 'Collagen Stimulation', 'Hand Rejuvenation'],
          notes: 'CaHA (Calcium Hydroxylapatite) 기반 필러',
        },
      },
      {
        product_name: 'Belotero',
        category: 'Injection',
        launch_year: 2005,
        price_tier: 'Premium',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'N/A',
          indications: ['Fine Lines', 'Volume', 'Lip Enhancement'],
          notes: 'BDDE 교차결합 HA 필러 라인업',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 245, source: 'IR 보고서' },
      { year: 2021, revenue_usd_m: 278, source: 'IR 보고서' },
      { year: 2022, revenue_usd_m: 300, source: 'IR 보고서' },
      { year: 2023, revenue_usd_m: 315, source: 'IR 보고서' },
      { year: 2024, revenue_usd_m: 320, source: 'IR 보고서' },
    ],
    events: [
      { date: '2022-06', type: 'Launch',      description: 'Ultherapy Next-Gen 트랜스듀서 라인 출시' },
      { date: '2023-04', type: 'Partnership', description: '한국 메디클라인 공식 파트너십 체결' },
      { date: '2023-11', type: 'Clinical',    description: 'Ultherapy + Radiesse 콤비 프로토콜 임상 발표' },
      { date: '2024-03', type: 'Launch',      description: 'Radiesse+ Lidocaine 한국 KFDA 승인' },
    ],
  },

  // 7. Cutera ──────────────────────────────────────────────────
  {
    competitor_id: 'cutera',
    company_name: 'Cutera',
    hq_country: 'USA',
    hq_flag: '🇺🇸',
    tier: 'Tier2',
    color: '#EA580C',
    description: 'NASDAQ 상장. truSculpt·AviClear 등 레이저·RF 기반 에스테틱 기업. 최근 매출 조정 중.',
    markets: ['NA', 'EU', 'SEA', 'Others'],
    device_categories: ['Laser', 'RF', 'Body', 'NeedleRF'],
    positioning: { price_score: 6.5, tech_score: 6.5, revenue_m: 118 },
    products: [
      {
        product_name: 'Secret RF',
        category: 'NeedleRF',
        launch_year: 2017,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional Microneedle RF',
          indications: ['Skin Resurfacing', 'Wrinkle', 'Scar'],
        },
      },
      {
        product_name: 'truSculpt iD',
        category: 'Body',
        launch_year: 2018,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Monopolar RF',
          indications: ['Fat Reduction', 'Body Contouring'],
          notes: '15분 비침습 지방 감소 프로토콜',
        },
      },
      {
        product_name: 'AviClear',
        category: 'Laser',
        launch_year: 2022,
        price_tier: 'Premium',
        certifications: ['FDA'],
        specs: {
          energy_type: 'Diode Laser (1726nm)',
          wavelength_nm: [1726],
          indications: ['Acne Treatment'],
          notes: '최초 여드름 치료 전용 레이저 FDA 승인',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 140, source: 'SEC 공시' },
      { year: 2021, revenue_usd_m: 194, source: 'SEC 공시' },
      { year: 2022, revenue_usd_m: 228, source: 'SEC 공시' },
      { year: 2023, revenue_usd_m: 168, source: 'SEC 공시' },
      { year: 2024, revenue_usd_m: 118, source: 'SEC 공시' },
    ],
    events: [
      { date: '2022-03', type: 'Launch',   description: 'AviClear 여드름 치료 레이저 FDA 승인 및 출시' },
      { date: '2023-08', type: 'Clinical', description: 'AviClear 3년 추적 임상 결과 발표 — 지속 효과 확인' },
      { date: '2024-04', type: 'Other',    description: '사업 구조 개편 및 비용 절감 전략 발표' },
    ],
  },

  // 8. VIOL ─────────────────────────────────────────────────────
  {
    competitor_id: 'viol',
    company_name: 'VIOL',
    company_name_ko: '비올',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#DB2777',
    description: 'Sylfirm X 기반 PW/CW RF 특화. 멜라즈마·혈관성 병변 특화 기술로 북미 시장 진출 가속.',
    markets: ['Korea', 'NA', 'EU', 'SEA'],
    device_categories: ['NeedleRF'],
    positioning: { price_score: 7.5, tech_score: 9.0, revenue_m: 55 },
    products: [
      {
        product_name: 'Sylfirm X',
        category: 'NeedleRF',
        launch_year: 2020,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Pulsed Wave + Continuous Wave RF (Microneedle)',
          indications: ['Melasma', 'Rosacea', 'Skin Rejuvenation', 'Scar'],
          notes: 'PW/CW 이중 모드 — 혈관성 병변 특화',
        },
      },
      {
        product_name: 'Sylfirm i-Plus',
        category: 'NeedleRF',
        launch_year: 2023,
        price_tier: 'Premium',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Microneedle RF + Light',
          indications: ['Skin Rejuvenation', 'Lifting', 'Pigmentation'],
          notes: '광에너지 복합 버전',
        },
      },
    ],
    financials: [
      { year: 2021, revenue_usd_m: 22, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 35, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 47, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 55, source: 'DART 공시' },
    ],
    events: [
      { date: '2022-05', type: 'Launch',   description: 'Sylfirm X FDA 510(k) 승인 획득' },
      { date: '2023-03', type: 'Launch',   description: 'Sylfirm i-Plus 국내 정식 출시' },
      { date: '2024-01', type: 'Clinical', description: 'Sylfirm X 멜라즈마 RCT 논문 JDDS 게재' },
    ],
  },

  // 9. Lutronic ─────────────────────────────────────────────────
  {
    competitor_id: 'lutronic',
    company_name: 'Lutronic',
    company_name_ko: '루트로닉',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#0284C7',
    description: 'Hologic 인수(2022). GENIUS NeedleRF·SPECTRA·Clarity II 보유 멀티 플랫폼.',
    markets: ['Korea', 'NA', 'EU', 'SEA'],
    device_categories: ['Laser', 'NeedleRF', 'HIFU'],
    positioning: { price_score: 6.5, tech_score: 7.5, revenue_m: 110 },
    products: [
      {
        product_name: 'GENIUS',
        category: 'NeedleRF',
        launch_year: 2016,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Microneedle RF (AI-powered)',
          indications: ['Skin Tightening', 'Acne Scar', 'Body'],
          notes: '실시간 조직 임피던스 피드백 기술',
        },
      },
      {
        product_name: 'Clarity II',
        category: 'Laser',
        launch_year: 2018,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Dual Wavelength Laser',
          wavelength_nm: [755, 1064],
          indications: ['Hair Removal', 'Vascular', 'Pigmentation'],
        },
      },
      {
        product_name: 'LaseMD Ultra',
        category: 'Laser',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Fractional Thulium Laser',
          wavelength_nm: [1927],
          indications: ['Skin Rejuvenation', 'Pigmentation', 'Drug Delivery'],
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 68,  source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 88,  source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 102, source: '업계추정' },
      { year: 2023, revenue_usd_m: 107, source: '업계추정' },
      { year: 2024, revenue_usd_m: 110, source: '업계추정' },
    ],
    events: [
      { date: '2022-01', type: 'MA',       description: 'Hologic에 인수 ($1.65B) — 글로벌 유통망 확보' },
      { date: '2023-04', type: 'Launch',   description: 'ULTRA 플랫폼 출시 — 4-in-1 복합 기기' },
      { date: '2024-02', type: 'Clinical', description: 'GENIUS+ 임상 데이터 ASDS 학회 발표' },
    ],
  },

  // 10. Jeisys ─────────────────────────────────────────────────
  {
    competitor_id: 'jeisys',
    company_name: 'Jeisys Medical',
    company_name_ko: '제이시스메디칼',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#65A30D',
    description: 'Ultracel Q+·Oligio 등 HIFU 라인업과 레이저 복합 플랫폼. KOSDAQ 상장.',
    markets: ['Korea', 'SEA', 'EU', 'Others'],
    device_categories: ['HIFU', 'Laser', 'RF', 'Combo'],
    positioning: { price_score: 5.5, tech_score: 7.0, revenue_m: 82 },
    products: [
      {
        product_name: 'Ultracel Q+',
        category: 'HIFU',
        launch_year: 2017,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'HIFU',
          handpieces: 4,
          indications: ['Lifting', 'Tightening'],
          depth_mm: [1.5, 3.0, 4.5, 6.0],
        },
      },
      {
        product_name: 'Oligio',
        category: 'RF',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Monopolar RF',
          indications: ['Lifting', 'Tightening'],
          notes: '1회 시술 효과 표방',
        },
      },
      {
        product_name: 'LAVIEEN',
        category: 'Laser',
        launch_year: 2016,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Fractional Micro-plasma',
          wavelength_nm: [1927],
          indications: ['Skin Rejuvenation', 'Pore', 'Tone'],
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 52, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 65, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 74, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 80, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 82, source: 'DART 공시' },
    ],
    events: [
      { date: '2022-09', type: 'Launch',      description: 'Ultracel Z HIFU 신제품 AI 모드 탑재' },
      { date: '2023-05', type: 'Partnership', description: 'SEA 유통 파트너십 확대 (태국·베트남)' },
      { date: '2024-03', type: 'Launch',      description: 'KIMES 2024 — 복합 플랫폼 신모델 공개' },
    ],
  },

  // 11. Wontech ────────────────────────────────────────────────
  {
    competitor_id: 'wontech',
    company_name: 'Wontech',
    company_name_ko: '원텍',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#B45309',
    description: '저레벨 레이저·HIFU 전문. Healite II 포토바이오모듈레이션 특화. KOSDAQ 상장.',
    markets: ['Korea', 'SEA', 'Others'],
    device_categories: ['Laser', 'HIFU'],
    positioning: { price_score: 4.5, tech_score: 6.0, revenue_m: 63 },
    products: [
      {
        product_name: 'Healite II',
        category: 'Laser',
        launch_year: 2010,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'LED / Low-Level Laser',
          wavelength_nm: [830, 633, 415],
          indications: ['Post-treatment Care', 'Wound Healing', 'Skin Rejuvenation'],
        },
      },
      {
        product_name: 'HELIOS III',
        category: 'Laser',
        launch_year: 2014,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Nd:YAG',
          wavelength_nm: [1064, 532],
          indications: ['Pigmentation', 'Tattoo Removal', 'Skin Toning'],
        },
      },
    ],
    financials: [
      { year: 2021, revenue_usd_m: 40, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 52, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 59, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 63, source: 'DART 공시' },
    ],
    events: [
      { date: '2023-03', type: 'Launch',      description: 'Healite III 차세대 모델 국내 출시' },
      { date: '2024-05', type: 'Partnership', description: '동남아 배급 파트너십 확장 (태국)' },
    ],
  },

  // 12. Hironic ────────────────────────────────────────────────
  {
    competitor_id: 'hironic',
    company_name: 'Hironic',
    company_name_ko: '하이로닉',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#6366F1',
    description: 'Doublo 시리즈 HIFU 전문. 국내 HIFU 선구자, SEA·중국 성장 가속 중. KOSDAQ 상장.',
    markets: ['Korea', 'SEA', 'China', 'Others'],
    device_categories: ['HIFU', 'RF', 'Laser'],
    positioning: { price_score: 5.0, tech_score: 6.5, revenue_m: 52 },
    products: [
      {
        product_name: 'Doublo Gold',
        category: 'HIFU',
        launch_year: 2016,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'HIFU (Linear & Focus)',
          handpieces: 3,
          indications: ['Lifting', 'Tightening', 'Body'],
          depth_mm: [3.0, 4.5, 6.0],
        },
      },
      {
        product_name: 'Doublo-S',
        category: 'HIFU',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'HIFU',
          handpieces: 4,
          indications: ['Lifting', 'Body Slimming'],
          depth_mm: [1.5, 3.0, 4.5, 6.0],
        },
      },
    ],
    financials: [
      { year: 2021, revenue_usd_m: 32, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 41, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 48, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 52, source: 'DART 공시' },
    ],
    events: [
      { date: '2022-11', type: 'Launch',      description: 'Doublo GOLD+ 출시 — 카트리지 방식 개선' },
      { date: '2023-06', type: 'Partnership', description: '베트남·인도네시아 공식 파트너 체결' },
      { date: '2024-04', type: 'Launch',      description: 'Doublo Gold II 차세대 모델 발표' },
    ],
  },

  // 13. Asterasys ──────────────────────────────────────────────
  {
    competitor_id: 'asterasys',
    company_name: 'Asterasys',
    company_name_ko: '아스테라시스',
    hq_country: 'Korea',
    hq_flag: '🇰🇷',
    tier: 'Emerging',
    color: '#F59E0B',
    description: '신규 진입 한국 에스테틱 기기 기업. 마이크로니들 RF·복합 에너지 디바이스 특화.',
    markets: ['Korea', 'SEA'],
    device_categories: ['NeedleRF', 'RF'],
    positioning: { price_score: 5.5, tech_score: 7.0, revenue_m: 28 },
    products: [
      {
        product_name: 'AGNES RF',
        category: 'NeedleRF',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Insulated Microneedle RF',
          indications: ['Acne', 'Sebaceous Gland Reduction', 'Lifting'],
          notes: '절연 침 기술로 표피 손상 최소화',
        },
      },
      {
        product_name: 'AGNES PRIME',
        category: 'RF',
        launch_year: 2022,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Multi-polar RF',
          indications: ['Skin Tightening', 'Lifting', 'Skin Rejuvenation'],
          notes: '국내 중소형 클리닉 타겟',
        },
      },
    ],
    financials: [
      { year: 2022, revenue_usd_m: 15, source: '업계추정' },
      { year: 2023, revenue_usd_m: 22, source: '업계추정' },
      { year: 2024, revenue_usd_m: 28, source: '업계추정' },
    ],
    events: [
      { date: '2022-09', type: 'Launch',      description: 'AGNES PRIME 국내 정식 출시' },
      { date: '2023-07', type: 'Partnership', description: '태국·말레이시아 SEA 파트너 계약 체결' },
      { date: '2024-03', type: 'Launch',      description: 'KIMES 2024 — 신규 복합 에너지 디바이스 공개' },
    ],
  },
]
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

오류 없음 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/app/market/_data/competitors.ts
git commit -m "feat(market): 경쟁사 정적 데이터 + 타입 정의 (13개사)"
```

---

## Task 2: 네비게이션 통합 (ia.ts)

**Files:**
- Modify: `src/constants/ia.ts`

- [ ] **Step 1: WorkspaceHub 타입에 'market' 추가**

`src/constants/ia.ts` 수정:

```typescript
export interface WorkspaceHub {
  key: 'dashboard' | 'projects' | 'blueberry' | 'monitoring' | 'some-content' | 'market'
  href: string
  label: string
  description: string
}
```

- [ ] **Step 2: WORKSPACE_HUBS 배열에 market 항목 추가**

`WORKSPACE_HUBS` 배열 끝에 추가:

```typescript
  {
    key: 'market',
    href: '/market',
    label: '시장조사',
    description: '경쟁사 인텔리전스 대시보드',
  },
```

- [ ] **Step 3: 커밋**

```bash
git add src/constants/ia.ts
git commit -m "feat(market): 워크스페이스 네비게이션에 시장조사 허브 추가"
```

---

## Task 3: 라우팅 파일 (layout + page)

**Files:**
- Create: `src/app/market/layout.tsx`
- Create: `src/app/market/page.tsx`

- [ ] **Step 1: layout.tsx 작성**

`src/app/market/layout.tsx`:

```typescript
import WorkspaceShell from '@/components/workspace/WorkspaceShell'

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell requireAuth>{children}</WorkspaceShell>
}
```

- [ ] **Step 2: page.tsx 작성**

`src/app/market/page.tsx`:

```typescript
import MarketClient from './_components/MarketClient'

export const metadata = { title: '시장조사 — Market Intelligence' }

export default function MarketPage() {
  return <MarketClient />
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/market/layout.tsx src/app/market/page.tsx
git commit -m "feat(market): 라우팅 layout + page 추가"
```

---

## Task 4: CompetitorCard 컴포넌트

**Files:**
- Create: `src/app/market/_components/CompetitorCard.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/market/_components/CompetitorCard.tsx`:

```typescript
'use client'

import type { Competitor, DeviceCategory, Tier } from '../_data/competitors'

const TIER_BADGE: Record<Tier, string> = {
  Tier1:    'bg-purple-100 text-purple-700 border-purple-200',
  Tier2:    'bg-blue-100 text-blue-700 border-blue-200',
  Emerging: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const CAT_LABEL: Record<DeviceCategory, string> = {
  HIFU:      'HIFU',
  RF:        'RF',
  NeedleRF:  'Needle RF',
  Laser:     'Laser',
  Body:      'Body',
  Injection: 'Injection',
  Combo:     'Combo',
}

interface Props {
  competitor: Competitor
  isMatched: boolean
  onClick: () => void
}

export default function CompetitorCard({ competitor: c, isMatched, onClick }: Props) {
  const latestRevenue = c.financials.at(-1)

  return (
    <button
      onClick={onClick}
      disabled={!isMatched}
      className={[
        'w-full text-left rounded-2xl border p-5 transition-all duration-300',
        c.is_classys
          ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
        !isMatched ? 'opacity-40 pointer-events-none' : '',
      ].join(' ')}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{c.hq_flag}</span>
          <div className="min-w-0">
            <p className={`font-bold text-sm leading-tight truncate ${c.is_classys ? 'text-blue-700' : 'text-gray-900'}`}>
              {c.company_name}
            </p>
            {c.company_name_ko && (
              <p className="text-xs text-gray-400 truncate">{c.company_name_ko}</p>
            )}
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${TIER_BADGE[c.tier]}`}>
          {c.tier}
        </span>
      </div>

      {/* 기기 카테고리 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {c.device_categories.slice(0, 4).map(cat => (
          <span
            key={cat}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
          >
            {CAT_LABEL[cat]}
          </span>
        ))}
        {c.device_categories.length > 4 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
            +{c.device_categories.length - 4}
          </span>
        )}
      </div>

      {/* 진출 시장 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {c.markets.slice(0, 4).map(m => (
          <span key={m} className="rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-500">
            {m}
          </span>
        ))}
        {c.markets.length > 4 && (
          <span className="rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-400">
            +{c.markets.length - 4}
          </span>
        )}
      </div>

      {/* 매출 */}
      {latestRevenue && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{latestRevenue.year}년 매출 (추정)</span>
          <span className={`text-sm font-bold ${c.is_classys ? 'text-blue-600' : 'text-gray-700'}`}>
            ${latestRevenue.revenue_usd_m}M
          </span>
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/market/_components/CompetitorCard.tsx
git commit -m "feat(market): CompetitorCard 컴포넌트"
```

---

## Task 5: CompetitorModal 컴포넌트

**Files:**
- Create: `src/app/market/_components/CompetitorModal.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/market/_components/CompetitorModal.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Competitor, Tier, EventType } from '../_data/competitors'

const TIER_BADGE: Record<Tier, string> = {
  Tier1:    'bg-purple-100 text-purple-700',
  Tier2:    'bg-blue-100 text-blue-700',
  Emerging: 'bg-emerald-100 text-emerald-700',
}

const EVENT_ICON: Record<EventType, string> = {
  Launch:      '🚀',
  MA:          '🤝',
  Partnership: '🌐',
  Clinical:    '🔬',
  Award:       '🏆',
  Other:       '📌',
}

const CERT_STYLE: Record<string, string> = {
  FDA:  'bg-blue-50 text-blue-700 border-blue-200',
  CE:   'bg-green-50 text-green-700 border-green-200',
  KFDA: 'bg-red-50 text-red-700 border-red-200',
}

interface Props {
  competitor: Competitor
  onClose: () => void
}

export default function CompetitorModal({ competitor: c, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const recentEvents = [...c.events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${c.is_classys ? 'bg-blue-50' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{c.hq_flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-bold ${c.is_classys ? 'text-blue-700' : 'text-gray-900'}`}>
                  {c.company_name}
                </h2>
                {c.company_name_ko && (
                  <span className="text-sm text-gray-400">{c.company_name_ko}</span>
                )}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_BADGE[c.tier]}`}>
                  {c.tier}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{c.hq_country}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 설명 */}
          <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>

          {/* 개요 + 매출 차트 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* 진출 시장 + 카테고리 */}
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">진출 시장</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.markets.map(m => (
                    <span key={m} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">기기 카테고리</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.device_categories.map(cat => (
                    <span
                      key={cat}
                      className="rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 매출 추이 차트 */}
            {c.financials.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  매출 추이 (USD M)
                </p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={c.financials}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={40} />
                    <Tooltip
                      formatter={(v: number) => [`$${v}M`, '매출']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue_usd_m"
                      stroke={c.color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: c.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="mt-1 text-right text-xs text-gray-400">
                  출처: {c.financials.at(-1)?.source}
                </p>
              </div>
            )}
          </div>

          {/* 제품 목록 */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              주요 제품 ({c.products.length}개)
            </p>
            <div className="space-y-2">
              {c.products.map(p => (
                <div key={p.product_name} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{p.product_name}</span>
                    <span className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-500">
                      {p.category}
                    </span>
                    <span className="text-xs text-gray-400">{p.launch_year}년</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.price_tier === 'Premium' ? 'bg-amber-50 text-amber-700' :
                      p.price_tier === 'Mid'     ? 'bg-gray-100 text-gray-600' :
                                                   'bg-green-50 text-green-700'
                    }`}>{p.price_tier}</span>
                    {p.certifications.map(cert => (
                      <span
                        key={cert}
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${CERT_STYLE[cert] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                  {p.specs.energy_type && (
                    <p className="mt-1.5 text-xs text-gray-500">{p.specs.energy_type}</p>
                  )}
                  {p.specs.indications && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {p.specs.indications.join(' · ')}
                    </p>
                  )}
                  {p.specs.notes && (
                    <p className="mt-0.5 text-xs text-blue-500 italic">{p.specs.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 주요 이벤트 */}
          {recentEvents.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                주요 이벤트 (최근 {recentEvents.length}건)
              </p>
              <div className="space-y-2">
                {recentEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-base">{EVENT_ICON[ev.type]}</span>
                    <div>
                      <span className="text-xs text-gray-400 mr-2">{ev.date}</span>
                      <span className="text-sm text-gray-700">{ev.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/market/_components/CompetitorModal.tsx
git commit -m "feat(market): CompetitorModal — 상세 정보 + 재무 차트"
```

---

## Task 6: PositioningMap 컴포넌트

**Files:**
- Create: `src/app/market/_components/PositioningMap.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/market/_components/PositioningMap.tsx`:

```typescript
'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import type { Competitor } from '../_data/competitors'

interface Props {
  competitors: Competitor[]
  matchedIds: Set<string>
  onSelectCompetitor: (id: string) => void
}

interface TooltipPayload {
  payload: Competitor & { x: number; y: number; r: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const c = payload[0].payload
  return (
    <div className="rounded-xl bg-gray-900 px-4 py-3 shadow-xl text-white text-xs space-y-1">
      <p className="font-bold text-sm">{c.hq_flag} {c.company_name}</p>
      <p>매출: <span className="font-semibold">${c.positioning.revenue_m}M</span></p>
      <p>가격: <span className="font-semibold">{c.positioning.price_score}/10</span></p>
      <p>기술: <span className="font-semibold">{c.positioning.tech_score}/10</span></p>
    </div>
  )
}

// 매출을 버블 크기(픽셀)로 변환
function revenueToRadius(revenue: number, min = 28, max = 448): number {
  return 12 + ((revenue - min) / (max - min)) * 28
}

export default function PositioningMap({ competitors, matchedIds, onSelectCompetitor }: Props) {
  const data = competitors.map(c => ({
    ...c,
    x: c.positioning.price_score,
    y: c.positioning.tech_score,
    r: revenueToRadius(c.positioning.revenue_m),
  }))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      {/* 범례 */}
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
          클래시스 (자사)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-gray-400" />
          경쟁사
        </span>
        <span>버블 크기 = 추정 매출 규모</span>
        <span className="text-gray-400">| 미매칭 항목은 흐리게 표시</span>
      </div>

      {/* 사분면 레이블 */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-2 left-[8%] text-xs text-gray-200 font-medium">고기술 / 가성비</div>
          <div className="absolute top-2 right-[4%] text-xs text-blue-200 font-medium">프리미엄 혁신</div>
          <div className="absolute bottom-8 left-[8%] text-xs text-gray-200 font-medium">보급형</div>
          <div className="absolute bottom-8 right-[4%] text-xs text-gray-200 font-medium">고가 레거시</div>
        </div>

        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[1, 10]}
              tickCount={10}
              label={{ value: '← Value · 가격 포지셔닝 · Premium →', position: 'bottom', offset: -5, style: { fontSize: 11, fill: '#9ca3af' } }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[1, 10]}
              tickCount={10}
              label={{ value: '기술 복잡도', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }}
              tick={{ fontSize: 11 }}
            />
            <ReferenceLine x={5.5} stroke="#e5e7eb" strokeDasharray="4 4" />
            <ReferenceLine y={5.5} stroke="#e5e7eb" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              onClick={(d) => matchedIds.has(d.competitor_id) && onSelectCompetitor(d.competitor_id)}
              style={{ cursor: 'pointer' }}
            >
              {data.map(entry => (
                <Cell
                  key={entry.competitor_id}
                  fill={entry.is_classys ? '#2563EB' : entry.color}
                  fillOpacity={matchedIds.has(entry.competitor_id) ? (entry.is_classys ? 1 : 0.75) : 0.12}
                  stroke={entry.is_classys ? '#1d4ed8' : 'transparent'}
                  strokeWidth={entry.is_classys ? 2 : 0}
                  r={entry.r}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 회사 목록 (범례) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {competitors.map(c => (
          <button
            key={c.competitor_id}
            onClick={() => matchedIds.has(c.competitor_id) && onSelectCompetitor(c.competitor_id)}
            disabled={!matchedIds.has(c.competitor_id)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-opacity ${
              matchedIds.has(c.competitor_id) ? 'opacity-100 hover:shadow-sm' : 'opacity-25'
            } ${c.is_classys ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: c.is_classys ? '#2563EB' : c.color }}
            />
            <span className={c.is_classys ? 'font-semibold text-blue-700' : 'text-gray-600'}>
              {c.company_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/market/_components/PositioningMap.tsx
git commit -m "feat(market): PositioningMap — Recharts ScatterChart 포지셔닝 맵"
```

---

## Task 7: SpecTable 컴포넌트

**Files:**
- Create: `src/app/market/_components/SpecTable.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/market/_components/SpecTable.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { Competitor, DeviceCategory, Product } from '../_data/competitors'

const CATEGORIES: { key: DeviceCategory; label: string }[] = [
  { key: 'HIFU',      label: 'HIFU' },
  { key: 'RF',        label: 'RF' },
  { key: 'NeedleRF',  label: 'Needle RF' },
  { key: 'Laser',     label: 'Laser' },
  { key: 'Body',      label: 'Body' },
  { key: 'Injection', label: 'Injection' },
  { key: 'Combo',     label: 'Combo' },
]

type SortKey = 'company' | 'product' | 'launch_year' | 'price_tier'
type SortDir = 'asc' | 'desc'

const PRICE_ORDER: Record<string, number> = { Premium: 3, Mid: 2, Value: 1 }

interface Row {
  competitor: Competitor
  product: Product
}

function sortRows(rows: Row[], key: SortKey, dir: SortDir): Row[] {
  return [...rows].sort((a, b) => {
    let cmp = 0
    if (key === 'company')      cmp = a.competitor.company_name.localeCompare(b.competitor.company_name)
    if (key === 'product')      cmp = a.product.product_name.localeCompare(b.product.product_name)
    if (key === 'launch_year')  cmp = a.product.launch_year - b.product.launch_year
    if (key === 'price_tier')   cmp = (PRICE_ORDER[a.product.price_tier] ?? 0) - (PRICE_ORDER[b.product.price_tier] ?? 0)
    return dir === 'asc' ? cmp : -cmp
  })
}

interface Props {
  competitors: Competitor[]
  matchedIds: Set<string>
  onSelectCompetitor: (id: string) => void
}

export default function SpecTable({ competitors, matchedIds, onSelectCompetitor }: Props) {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>('HIFU')
  const [sortKey, setSortKey] = useState<SortKey>('launch_year')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-gray-600" />
      : <ArrowDown className="h-3.5 w-3.5 text-gray-600" />
  }

  const rows: Row[] = competitors.flatMap(c =>
    c.products
      .filter(p => p.category === activeCategory)
      .map(p => ({ competitor: c, product: p }))
  )

  // Classys 먼저, 나머지는 정렬
  const classysRows = rows.filter(r => r.competitor.is_classys)
  const otherRows   = sortRows(rows.filter(r => !r.competitor.is_classys), sortKey, sortDir)
  const sorted = [...classysRows, ...otherRows]

  const hasCert = (p: Product, cert: string) => p.certifications.includes(cert)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* 카테고리 탭 */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50 px-4 py-3">
        {CATEGORIES.map(cat => {
          const count = competitors.flatMap(c => c.products).filter(p => p.category === cat.key).length
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={[
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeCategory === cat.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {cat.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
          해당 카테고리에 등록된 제품이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {([
                  { key: 'company' as SortKey,     label: '회사' },
                  { key: 'product' as SortKey,     label: '제품명' },
                  { key: 'launch_year' as SortKey, label: '출시연도' },
                  { key: 'price_tier' as SortKey,  label: '가격티어' },
                ] as const).map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer px-4 py-3 text-left font-semibold text-gray-600 hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon k={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold text-gray-600">에너지 유형</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">주요 적응증</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">FDA</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">CE</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">KFDA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(({ competitor: c, product: p }, i) => {
                const isMatched = matchedIds.has(c.competitor_id)
                return (
                  <tr
                    key={`${c.competitor_id}-${p.product_name}`}
                    onClick={() => isMatched && onSelectCompetitor(c.competitor_id)}
                    className={[
                      'transition-all duration-200',
                      c.is_classys ? 'bg-blue-50' : 'hover:bg-gray-50',
                      !isMatched ? 'opacity-30' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span>{c.hq_flag}</span>
                        <span className={`font-medium ${c.is_classys ? 'text-blue-700' : 'text-gray-800'}`}>
                          {c.company_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.product_name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.launch_year}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.price_tier === 'Premium' ? 'bg-amber-50 text-amber-700' :
                        p.price_tier === 'Mid'     ? 'bg-gray-100 text-gray-600' :
                                                     'bg-green-50 text-green-700'
                      }`}>{p.price_tier}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px]">
                      {p.specs.energy_type ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px]">
                      {p.specs.indications?.slice(0, 3).join(' · ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasCert(p, 'FDA')  ? <span className="text-blue-500 font-bold">✓</span> : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasCert(p, 'CE')   ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasCert(p, 'KFDA') ? <span className="text-red-500 font-bold">✓</span> : <span className="text-gray-200">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/market/_components/SpecTable.tsx
git commit -m "feat(market): SpecTable — 카테고리별 제품 스펙 비교 테이블"
```

---

## Task 8: MarketClient 메인 오케스트레이터

**Files:**
- Create: `src/app/market/_components/MarketClient.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/market/_components/MarketClient.tsx`:

```typescript
'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { BarChart3, Map, Table2, RotateCcw } from 'lucide-react'
import { COMPETITORS } from '../_data/competitors'
import type { Region, DeviceCategory, Tier, Competitor } from '../_data/competitors'
import CompetitorCard from './CompetitorCard'
import CompetitorModal from './CompetitorModal'

const PositioningMap = dynamic(() => import('./PositioningMap'), { ssr: false })
const SpecTable      = dynamic(() => import('./SpecTable'),      { ssr: false })

// ── 필터 메타데이터 ────────────────────────────────────────────────
const REGIONS: { key: Region; label: string }[] = [
  { key: 'Korea',  label: '국내 (Korea)' },
  { key: 'NA',     label: '북미 (NA)' },
  { key: 'EU',     label: '유럽 (EU)' },
  { key: 'China',  label: '중국 (China)' },
  { key: 'SEA',    label: '동남아 (SEA)' },
  { key: 'Others', label: '기타 (Others)' },
]

const CATEGORIES: { key: DeviceCategory; label: string; desc: string }[] = [
  { key: 'HIFU',      label: 'HIFU',       desc: '집속 초음파' },
  { key: 'RF',        label: 'RF',         desc: '고주파' },
  { key: 'NeedleRF',  label: 'Needle RF',  desc: '미세침 고주파' },
  { key: 'Laser',     label: 'Laser',      desc: '레이저/IPL' },
  { key: 'Body',      label: 'Body',       desc: '체형 관리' },
  { key: 'Injection', label: 'Injection',  desc: '주사' },
  { key: 'Combo',     label: 'Combo',      desc: '복합기기' },
]

const TIERS: { key: Tier; label: string }[] = [
  { key: 'Tier1',    label: 'Tier 1' },
  { key: 'Tier2',    label: 'Tier 2' },
  { key: 'Emerging', label: '신규진입' },
]

type Tab = 'cards' | 'map' | 'specs'

// ── 필터 칩 컴포넌트 ──────────────────────────────────────────────
function FilterChip({
  label, active, onClick, color,
}: {
  label: string; active: boolean; onClick: () => void; color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50',
      ].join(' ')}
      style={active ? { backgroundColor: color ?? '#111827', borderColor: color ?? '#111827' } : undefined}
    >
      {label}
    </button>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function MarketClient() {
  const [tab,        setTab]        = useState<Tab>('cards')
  const [regions,    setRegions]    = useState<Set<Region>>(new Set())
  const [categories, setCategories] = useState<Set<DeviceCategory>>(new Set())
  const [tiers,      setTiers]      = useState<Set<Tier>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const hasFilter = regions.size > 0 || categories.size > 0 || tiers.size > 0

  function toggleRegion(k: Region) {
    setRegions(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }
  function toggleCategory(k: DeviceCategory) {
    setCategories(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }
  function toggleTier(k: Tier) {
    setTiers(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }
  function resetFilters() {
    setRegions(new Set()); setCategories(new Set()); setTiers(new Set())
  }

  function isMatch(c: Competitor): boolean {
    if (c.is_classys) return true
    const rOk = regions.size    === 0 || c.markets.some(m => regions.has(m))
    const cOk = categories.size === 0 || c.device_categories.some(d => categories.has(d))
    const tOk = tiers.size      === 0 || tiers.has(c.tier)
    return rOk && cOk && tOk
  }

  const matchedIds = useMemo(
    () => new Set(COMPETITORS.filter(isMatch).map(c => c.competitor_id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regions, categories, tiers],
  )

  const selectedCompetitor = selectedId
    ? COMPETITORS.find(c => c.competitor_id === selectedId) ?? null
    : null

  const matchedCount = matchedIds.size

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'cards', label: '경쟁사 카드',  icon: BarChart3 },
    { key: 'map',   label: '포지셔닝 맵',  icon: Map },
    { key: 'specs', label: '스펙 비교',    icon: Table2 },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">시장조사</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Market Intelligence — 경쟁사 {matchedCount}/{COMPETITORS.length}개 표시 중
            </p>
          </div>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              필터 초기화
            </button>
          )}
        </div>

        {/* 필터 영역 */}
        <div className="mt-4 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-xs font-semibold text-gray-400">지역</span>
            {REGIONS.map(r => (
              <FilterChip
                key={r.key}
                label={r.label}
                active={regions.has(r.key)}
                onClick={() => toggleRegion(r.key)}
                color="#374151"
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-xs font-semibold text-gray-400">기기</span>
            {CATEGORIES.map(c => (
              <FilterChip
                key={c.key}
                label={c.label}
                active={categories.has(c.key)}
                onClick={() => toggleCategory(c.key)}
                color="#374151"
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-xs font-semibold text-gray-400">티어</span>
            {TIERS.map(t => (
              <FilterChip
                key={t.key}
                label={t.label}
                active={tiers.has(t.key)}
                onClick={() => toggleTier(t.key)}
                color={t.key === 'Tier1' ? '#7C3AED' : t.key === 'Tier2' ? '#2563EB' : '#059669'}
              />
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div className="mt-4 flex gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                tab === key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Module A — 경쟁사 카드 */}
        {tab === 'cards' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COMPETITORS.map(c => (
              <CompetitorCard
                key={c.competitor_id}
                competitor={c}
                isMatched={matchedIds.has(c.competitor_id)}
                onClick={() => setSelectedId(c.competitor_id)}
              />
            ))}
          </div>
        )}

        {/* Module B — 포지셔닝 맵 */}
        {tab === 'map' && (
          <PositioningMap
            competitors={COMPETITORS}
            matchedIds={matchedIds}
            onSelectCompetitor={setSelectedId}
          />
        )}

        {/* Module D — 스펙 비교 */}
        {tab === 'specs' && (
          <SpecTable
            competitors={COMPETITORS}
            matchedIds={matchedIds}
            onSelectCompetitor={setSelectedId}
          />
        )}
      </div>

      {/* 경쟁사 상세 모달 */}
      {selectedCompetitor && (
        <CompetitorModal
          competitor={selectedCompetitor}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

오류 없음 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/app/market/_components/MarketClient.tsx
git commit -m "feat(market): MarketClient — 필터 + 탭 오케스트레이터 완성"
```

---

## Task 9: 빌드 검증 및 최종 커밋

- [ ] **Step 1: 전체 빌드 실행**

```bash
npm run build
```

에러 없이 완료되는지 확인. 에러 발생 시 메시지에 따라 수정.

- [ ] **Step 2: 개발 서버 실행 후 직접 확인**

```bash
npm run dev
```

브라우저에서 아래 체크리스트 확인:

- [ ] `/market` 라우트 정상 접속
- [ ] 사이드바 네비게이션에 '시장조사' 항목 표시
- [ ] 경쟁사 카드 13개 렌더링 (Classys 첫 번째, 파란 테두리)
- [ ] 지역 필터 클릭 시 비매칭 카드 dimming (opacity-40)
- [ ] 기기 카테고리 필터 작동
- [ ] 티어 필터 작동
- [ ] 필터 초기화 버튼 작동
- [ ] 카드 클릭 시 모달 열림 (재무 차트 포함)
- [ ] ESC 키 또는 배경 클릭으로 모달 닫힘
- [ ] '포지셔닝 맵' 탭 — 버블 차트 렌더링, Classys 파란 버블 강조
- [ ] '스펙 비교' 탭 — HIFU 기본 선택, 카테고리 탭 전환, 컬럼 정렬

- [ ] **Step 3: 최종 커밋**

```bash
git add -A
git commit -m "feat(market): 시장조사 Market Intelligence Phase 1 MVP 완성

- 경쟁사 13개사 정적 데이터 (DART/SEC 공시 + 업계추정)
- Module A: 경쟁사 카드 + 상세 모달 (재무 차트)
- Module B: 포지셔닝 맵 (Recharts ScatterChart)
- Module D: 스펙 비교 테이블 (카테고리별, 컬럼 정렬)
- 지역/기기카테고리/티어 복합 필터 + dimming 처리
- Classys 항상 강조 고정

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
