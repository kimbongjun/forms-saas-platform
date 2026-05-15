export type Region = 'Korea' | 'NA' | 'EU' | 'China' | 'SEA' | 'Others'

// NeedleRF = MNRF (Microneedle RF / Fractional RF Microneedling)
export type DeviceCategory = 'HIFU' | 'RF' | 'NeedleRF' | 'Laser' | 'Body' | 'Injection' | 'Combo'
export type Tier = 'Tier1' | 'Tier2' | 'Emerging'
export type PriceTier = 'Premium' | 'Mid' | 'Value'
export type EventType = 'Launch' | 'MA' | 'Partnership' | 'Clinical' | 'Award' | 'Other'
export type DataSource = 'DART 공시' | 'SEC 공시' | '업계추정' | 'IR 보고서' | 'AI 검증'

export interface DataConfidence {
  level: 'verified' | 'estimated' | 'ai-enriched'
  source: DataSource
  verified_at?: string // ISO date string
  serper_queries?: string[]
}

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
  source_url?: string
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
  confidence: DataConfidence
}

export const COMPETITORS: Competitor[] = [
  {
    competitor_id: 'classys',
    company_name: 'Classys',
    company_name_ko: '클래시스',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier1',
    is_classys: true,
    color: '#3B82F6',
    description: '국내 HIFU·NeedleRF 선도 기업. Ultraformer 시리즈로 글로벌 점유율 확대 중.',
    markets: ['Korea', 'EU', 'SEA', 'NA', 'China'],
    // Ultraformer III/MPT/Shurink = HIFU, Volnewmer = NeedleRF (Insulated Needle RF)
    device_categories: ['HIFU', 'NeedleRF'],
    positioning: { price_score: 7.5, tech_score: 8.5, revenue_m: 285 },
    products: [
      {
        product_name: 'Ultraformer III',
        category: 'HIFU',
        launch_year: 2017,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-focused HIFU',
          handpieces: 5,
          indications: ['Face lifting', 'Skin tightening', 'Body contouring'],
          depth_mm: [1.5, 3.0, 4.5, 6.0, 9.0],
          notes: '글로벌 누적 판매 1위 HIFU 기기',
        },
      },
      {
        product_name: 'Ultraformer MPT',
        category: 'HIFU',
        launch_year: 2023,
        price_tier: 'Premium',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-pulsing HIFU',
          handpieces: 6,
          indications: ['Face lifting', 'Skin tightening'],
          notes: 'Micro-pulsing technology 적용 차세대 HIFU',
        },
      },
      {
        product_name: 'Volnewmer',
        category: 'NeedleRF',
        launch_year: 2021,
        price_tier: 'Premium',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Insulated Microneedle RF',
          indications: ['Skin resurfacing', 'Acne scar', 'Pore minimizing'],
          notes: '절연침 기술로 진피층 선택적 가열 (MNRF)',
        },
      },
      {
        product_name: 'Shurink Universe',
        category: 'HIFU',
        launch_year: 2022,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Micro-focused HIFU',
          handpieces: 4,
          indications: ['Face lifting', 'Skin tightening'],
          notes: '국내 클리닉 보급형 HIFU',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 178, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 215, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 248, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 270, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 285, source: 'DART 공시' },
    ],
    events: [
      { date: '2025-03', type: 'Other', description: 'KIMES 2025 참가 — Ultraformer MPT 신규 카트리지 및 Volnewmer 2세대 시제품 공개' },
      { date: '2025-01', type: 'Clinical', description: 'Ultraformer MPT 피부 탄력 개선 임상 결과 JDDG 온라인 선공개' },
      { date: '2024-03', type: 'Other', description: 'KIMES 2024 참가 — Ultraformer MPT 국내 론칭' },
      { date: '2023-10', type: 'Launch', description: 'Ultraformer MPT CE 인증 획득 및 유럽 출시' },
      { date: '2023-04', type: 'Award', description: 'ASLMS 2023 Best Device 수상' },
      { date: '2022-06', type: 'Partnership', description: 'Sinclair Pharma와 유럽 공동 마케팅 협약' },
    ],
    confidence: { level: 'verified', source: 'DART 공시' },
  },
  {
    competitor_id: 'inmode',
    company_name: 'InMode',
    hq_country: 'Israel',
    hq_flag: '🇮🇱',
    tier: 'Tier1',
    color: '#8B5CF6',
    description: '미국 상장(NASDAQ) RF·NeedleRF 강자. Morpheus8으로 글로벌 인지도 확보.',
    markets: ['NA', 'EU', 'Korea', 'SEA', 'China'],
    // Morpheus8 = Fractional RF Microneedling(NeedleRF), BodyTite = Bipolar RF, Evolve/FaceTite = RF
    // InMode는 HIFU 장비 없음 — 수정
    device_categories: ['RF', 'NeedleRF', 'Body'],
    positioning: { price_score: 9, tech_score: 8, revenue_m: 448 },
    products: [
      {
        product_name: 'Morpheus8',
        category: 'NeedleRF',
        launch_year: 2019,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional RF Microneedling (MNRF)',
          indications: ['Skin remodeling', 'Subdermal fat reduction', 'Acne scar'],
          notes: '셀럽·SNS 바이럴로 글로벌 1위 NeedleRF',
        },
      },
      {
        product_name: 'BodyTite',
        category: 'RF',
        launch_year: 2015,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Bipolar RF (Radiofrequency-Assisted Lipolysis)',
          indications: ['Body contouring', 'Skin laxity treatment'],
          notes: 'RFAL 기술 — 피하지방층에 양극 RF 적용',
        },
      },
      {
        product_name: 'FaceTite',
        category: 'RF',
        launch_year: 2017,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Bipolar RF (RFAL)',
          indications: ['Face contouring', 'Jowl lifting', 'Skin tightening'],
        },
      },
      {
        product_name: 'Evolve X',
        category: 'Body',
        launch_year: 2021,
        price_tier: 'Premium',
        certifications: ['FDA'],
        specs: {
          energy_type: 'RF + EMS (Electrical Muscle Stimulation)',
          indications: ['Body contouring', 'Muscle toning', 'Skin remodeling'],
          notes: '핸즈프리 바디 리모델링 플랫폼 (3-in-1)',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 207, source: 'SEC 공시' },
      { year: 2021, revenue_usd_m: 357, source: 'SEC 공시' },
      { year: 2022, revenue_usd_m: 460, source: 'SEC 공시' },
      { year: 2023, revenue_usd_m: 490, source: 'SEC 공시' },
      { year: 2024, revenue_usd_m: 448, source: 'SEC 공시' },
    ],
    events: [
      { date: '2025-05', type: 'Launch', description: 'Morpheus8 Prime 공식 발표 — 시술 시간 30% 단축·통증 최소화 모드 신규 탑재' },
      { date: '2025-02', type: 'Other', description: 'Q4 2024 실적 발표 — 전년비 감소폭 축소, 2025 점진적 회복 가이던스 제시' },
      { date: '2024-01', type: 'Launch', description: 'Morpheus8 Body 업그레이드 버전 FDA 클리어런스' },
      { date: '2023-05', type: 'Partnership', description: '한국 공식 파트너 변경 — 국내 공격적 확장' },
      { date: '2022-11', type: 'Clinical', description: 'Morpheus8 임상 논문 JAMA Dermatology 게재' },
    ],
    confidence: { level: 'verified', source: 'SEC 공시' },
  },
  {
    competitor_id: 'solta',
    company_name: 'Solta Medical',
    hq_country: 'USA',
    hq_flag: '🇺🇸',
    tier: 'Tier1',
    color: '#06B6D4',
    description: 'Thermage·Fraxel·Clear + Brilliant 등 레거시 강자. Bausch Health 산하.',
    markets: ['NA', 'EU', 'Korea', 'China', 'SEA'],
    // Thermage = Monopolar RF (HIFU 아님!), Fraxel = Fractional Laser, Liposonix = HIFU-based body
    // 수정: HIFU 제거, Body 추가 (Liposonix는 body fat용 ultrasound이므로 Body로 분류)
    device_categories: ['RF', 'Laser', 'Body'],
    positioning: { price_score: 8.5, tech_score: 7, revenue_m: 210 },
    products: [
      {
        product_name: 'Thermage FLX',
        category: 'RF',
        launch_year: 2018,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Capacitive Monopolar RF (CRF)',
          indications: ['Skin tightening', 'Contouring', 'Smoothing wrinkles'],
          notes: '단회 시술 Monopolar RF 대명사 — HIFU가 아닌 RF 기반',
        },
      },
      {
        product_name: 'Fraxel DUAL',
        category: 'Laser',
        launch_year: 2011,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional Nonablative Laser',
          wavelength_nm: [1550, 1927],
          indications: ['Skin resurfacing', 'Pigmentation', 'Acne scar'],
          notes: '1550nm (ERBIUM) + 1927nm (Thulium) 이중 파장',
        },
      },
      {
        product_name: 'Liposonix',
        category: 'Body',
        launch_year: 2011,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'High-intensity focused ultrasound (body)',
          indications: ['Subcutaneous fat reduction'],
          notes: '복부 지방 감소 전용 HIFU — 안면 리프팅 HIFU와 별개',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 155, source: '업계추정' },
      { year: 2021, revenue_usd_m: 180, source: '업계추정' },
      { year: 2022, revenue_usd_m: 200, source: '업계추정' },
      { year: 2023, revenue_usd_m: 208, source: '업계추정' },
      { year: 2024, revenue_usd_m: 210, source: '업계추정' },
    ],
    events: [
      { date: '2025-02', type: 'Launch', description: 'Thermage FLX Next Gen 출시 — 신형 컴포트 팁 적용, 시술 통증 최대 40% 감소' },
      { date: '2025-04', type: 'Clinical', description: 'Clear + Brilliant Tempo 아시아 피부 타입별 임상 데이터 ASLMS 2025 발표' },
      { date: '2024-02', type: 'Launch', description: 'Thermage FLX 5.0 업데이트 — 시술 시간 20% 단축' },
      { date: '2023-06', type: 'Clinical', description: 'Fraxel DUAL 아시아인 피부 임상 발표' },
      { date: '2022-09', type: 'MA', description: 'Bausch Health 인수 후 재브랜딩 완료' },
    ],
    confidence: { level: 'estimated', source: '업계추정' },
  },
  {
    competitor_id: 'alma',
    company_name: 'Alma Lasers',
    hq_country: 'Israel',
    hq_flag: '🇮🇱',
    tier: 'Tier1',
    color: '#F59E0B',
    description: 'Soprano Ice·Harmony XL Pro 등 다채널 에너지 플랫폼 포트폴리오 보유.',
    markets: ['EU', 'NA', 'Korea', 'SEA', 'China', 'Others'],
    // Soprano Ice = Diode Laser, Harmony XL Pro = Multi-platform (Laser+RF+IPL), Accent Prime = RF+Ultrasound
    // Alma는 별도 HIFU 전용 제품 없음 (Accent의 초음파는 BodyFX 계열 RF+Ultrasound 복합)
    device_categories: ['Laser', 'RF', 'Combo'],
    positioning: { price_score: 7, tech_score: 7.5, revenue_m: 180 },
    products: [
      {
        product_name: 'Soprano Ice Platinum',
        category: 'Laser',
        launch_year: 2018,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'SHR Diode Laser (755/808/1064nm)',
          wavelength_nm: [755, 808, 1064],
          indications: ['Permanent hair reduction', 'Skin rejuvenation'],
          notes: '3파장 동시조사 — 모든 피부 타입 대응 SHR 제모',
        },
      },
      {
        product_name: 'Harmony XL Pro',
        category: 'Combo',
        launch_year: 2016,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Multi-technology platform (Nd:YAG / Er:YAG / AFT / RF)',
          indications: ['65+ treatments across skin conditions'],
          notes: '65개 이상 적용증 가능한 모듈식 복합 플랫폼',
        },
      },
      {
        product_name: 'Accent Prime',
        category: 'RF',
        launch_year: 2017,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Unipolar RF + Ultrasound',
          indications: ['Body contouring', 'Skin tightening', 'Cellulite'],
          notes: 'RF + 초음파 결합 복합기기 — 면 HIFU와 다름',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 130, source: '업계추정' },
      { year: 2021, revenue_usd_m: 155, source: '업계추정' },
      { year: 2022, revenue_usd_m: 170, source: '업계추정' },
      { year: 2023, revenue_usd_m: 178, source: '업계추정' },
      { year: 2024, revenue_usd_m: 180, source: '업계추정' },
    ],
    events: [
      { date: '2025-04', type: 'Launch', description: 'Alma TED Plus 두피·모발 재생 치료기 한국 KFDA 허가 및 출시' },
      { date: '2025-01', type: 'Other', description: 'IMCAS World Congress 2025 파리 참가 — Harmony XL Pro 모듈 신규 라인업 공개' },
      { date: '2024-04', type: 'Launch', description: 'Alma TED 두피 재생 치료기 국내 출시' },
      { date: '2023-03', type: 'Partnership', description: '아시아 파트너 네트워크 확대' },
    ],
    confidence: { level: 'estimated', source: '업계추정' },
  },
  {
    competitor_id: 'syneron-candela',
    company_name: 'Syneron-Candela',
    hq_country: 'Israel',
    hq_flag: '🇮🇱',
    tier: 'Tier1',
    color: '#10B981',
    description: 'GentleMax Pro·VelaShape 시리즈로 Laser·RF 시장 글로벌 점유.',
    markets: ['NA', 'EU', 'Korea', 'SEA', 'Others'],
    // GentleMax Pro = Nd:YAG+Alexandrite Laser, VelaShape = RF+IR+Vacuum, eMax = RF+Laser
    // HIFU·NeedleRF 전용 제품 없음
    device_categories: ['Laser', 'RF', 'Body'],
    positioning: { price_score: 8, tech_score: 7, revenue_m: 240 },
    products: [
      {
        product_name: 'GentleMax Pro Plus',
        category: 'Laser',
        launch_year: 2022,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Nd:YAG 1064nm + Alexandrite 755nm',
          wavelength_nm: [755, 1064],
          indications: ['Hair removal', 'Vascular lesions', 'Pigmentation', 'Skin rejuvenation'],
          notes: 'Dynamic Cooling Device(DCD) 내장',
        },
      },
      {
        product_name: 'VelaShape III',
        category: 'Body',
        launch_year: 2012,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Bipolar RF + Infrared + Vacuum + Mechanical massage',
          indications: ['Cellulite reduction', 'Body contouring', 'Circumferential reduction'],
          notes: 'elos 기술(elōs) = RF + 광에너지 결합',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 190, source: '업계추정' },
      { year: 2021, revenue_usd_m: 215, source: '업계추정' },
      { year: 2022, revenue_usd_m: 235, source: '업계추정' },
      { year: 2023, revenue_usd_m: 242, source: '업계추정' },
      { year: 2024, revenue_usd_m: 240, source: '업계추정' },
    ],
    events: [
      { date: '2025-06', type: 'Launch', description: 'VelaShape IV 유럽 CE 인증 취득 — 4세대 셀룰라이트 치료 플랫폼 출시' },
      { date: '2025-03', type: 'Clinical', description: 'GentleMax Pro Plus 아시아 피부 타입 다기관 임상 결과 ASLMS 2025 발표' },
      { date: '2024-01', type: 'Launch', description: 'GentleMax Pro Plus 한국 KFDA 허가' },
      { date: '2023-10', type: 'Clinical', description: 'VelaShape III 셀룰라이트 RCT 결과 발표' },
    ],
    confidence: { level: 'estimated', source: '업계추정' },
  },
  {
    competitor_id: 'merz',
    company_name: 'Merz Aesthetics',
    hq_country: 'Germany',
    hq_flag: '🇩🇪',
    tier: 'Tier1',
    color: '#EC4899',
    description: 'Ultherapy·Xeomin·Radiesse 포트폴리오 보유. 독일계 에스테틱 대기업.',
    markets: ['EU', 'NA', 'Korea', 'SEA', 'China', 'Others'],
    // Ultherapy = Micro-focused HIFU, Xeomin/Radiesse = Injection
    device_categories: ['HIFU', 'Injection'],
    positioning: { price_score: 9, tech_score: 8, revenue_m: 320 },
    products: [
      {
        product_name: 'Ultherapy',
        category: 'HIFU',
        launch_year: 2009,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-focused Ultrasound with Visualization (MFU-V)',
          depth_mm: [1.5, 3.0, 4.5],
          indications: ['Brow lifting', 'Neck tightening', 'Submental laxity', 'Décolletage'],
          notes: 'FDA 최초 안면 HIFU 리프팅 승인 기기 (2009년)',
        },
      },
      {
        product_name: 'Ultherapy Prime',
        category: 'HIFU',
        launch_year: 2023,
        price_tier: 'Premium',
        certifications: ['FDA'],
        specs: {
          energy_type: 'Micro-focused Ultrasound with Visualization (MFU-V)',
          notes: '2세대 Ultherapy — 시술 시간 50% 단축, 편안함 개선',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 245, source: 'IR 보고서' },
      { year: 2021, revenue_usd_m: 280, source: 'IR 보고서' },
      { year: 2022, revenue_usd_m: 305, source: 'IR 보고서' },
      { year: 2023, revenue_usd_m: 315, source: 'IR 보고서' },
      { year: 2024, revenue_usd_m: 320, source: 'IR 보고서' },
    ],
    events: [
      { date: '2025-03', type: 'Partnership', description: 'Merz Aesthetics Korea 직판 전환 선언 — 국내 독립 판매 법인 설립 계획 공개' },
      { date: '2025-01', type: 'Other', description: 'IMCAS 2025 참가 — Ultherapy Prime 신규 프로토콜 및 아시아 임상 결과 발표' },
      { date: '2023-09', type: 'Launch', description: 'Ultherapy Prime 미국 FDA 510(k) 클리어런스' },
      { date: '2023-03', type: 'Partnership', description: '한국 메디트론과 유통 계약 연장' },
    ],
    confidence: { level: 'verified', source: 'IR 보고서' },
  },
  {
    competitor_id: 'cutera',
    company_name: 'Cutera',
    hq_country: 'USA',
    hq_flag: '🇺🇸',
    tier: 'Tier2',
    color: '#6366F1',
    description: '미국 상장 중견 에스테틱 기기 기업. Secret RF(NeedleRF)·truSculpt·Excel V 보유.',
    markets: ['NA', 'EU', 'SEA', 'Others'],
    // Secret RF = Fractional RF Microneedling (NeedleRF), truSculpt iD = Monopolar RF, Excel V = Laser
    // 수정: NeedleRF 추가
    device_categories: ['NeedleRF', 'RF', 'Laser'],
    positioning: { price_score: 6.5, tech_score: 6.5, revenue_m: 118 },
    products: [
      {
        product_name: 'Secret RF',
        category: 'NeedleRF',
        launch_year: 2018,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional RF Microneedling (MNRF)',
          indications: ['Skin resurfacing', 'Acne scar treatment', 'Wrinkle reduction'],
          notes: 'Insulated microneedles + bipolar RF — Morpheus8 직접 경쟁 제품',
        },
      },
      {
        product_name: 'truSculpt iD',
        category: 'RF',
        launch_year: 2018,
        price_tier: 'Mid',
        certifications: ['FDA'],
        specs: {
          energy_type: 'Monopolar RF (15 MHz)',
          indications: ['Non-invasive fat reduction', 'Body contouring'],
          notes: '핸즈프리 패널형 RF 바디 컨투어링',
        },
      },
      {
        product_name: 'Excel V+',
        category: 'Laser',
        launch_year: 2021,
        price_tier: 'Premium',
        certifications: ['FDA'],
        specs: {
          energy_type: 'KTP 532nm + Nd:YAG 1064nm',
          wavelength_nm: [532, 1064],
          indications: ['Vascular lesions', 'Rosacea', 'Pigmentation', 'Skin rejuvenation'],
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 100, source: 'SEC 공시' },
      { year: 2021, revenue_usd_m: 138, source: 'SEC 공시' },
      { year: 2022, revenue_usd_m: 183, source: 'SEC 공시' },
      { year: 2023, revenue_usd_m: 143, source: 'SEC 공시' },
      { year: 2024, revenue_usd_m: 118, source: 'SEC 공시' },
    ],
    events: [
      { date: '2025-04', type: 'Launch', description: 'AviClear 2.0 FDA 510(k) 승인 — 여드름 치료 레이저 2세대, 적응증 확대' },
      { date: '2025-01', type: 'Other', description: '신임 CEO 취임 — 포트폴리오 집중화 및 수익성 개선 중심 사업 재편 선언' },
      { date: '2024-02', type: 'Other', description: '구조조정 발표 — 인력 20% 감축, 수익성 집중' },
      { date: '2023-07', type: 'Launch', description: 'AviClear 여드름 치료 레이저(1726nm) 파이프라인 확대' },
    ],
    confidence: { level: 'verified', source: 'SEC 공시' },
  },
  {
    competitor_id: 'viol',
    company_name: 'VIOL',
    company_name_ko: '비올',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#F97316',
    description: 'SYLFIRM X 단일 품목으로 NeedleRF 글로벌 시장 공략. 소형·고성장.',
    markets: ['Korea', 'NA', 'SEA', 'EU'],
    // SYLFIRM X = PW+CW Radiofrequency Microneedling (NeedleRF) — VIOL은 NeedleRF 전문기업
    device_categories: ['NeedleRF'],
    positioning: { price_score: 7, tech_score: 8, revenue_m: 55 },
    products: [
      {
        product_name: 'SYLFIRM X',
        category: 'NeedleRF',
        launch_year: 2021,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Pulsed Wave (PW) + Continuous Wave (CW) RF Microneedling',
          indications: ['Melasma', 'Vascular lesions', 'Skin rejuvenation', 'Rosacea'],
          notes: 'PW·CW 이중 모드 특허 — 멜라즈마 치료 FDA 승인 유일 NeedleRF',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 18, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 28, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 40, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 50, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 55, source: 'DART 공시' },
    ],
    events: [
      { date: '2025-05', type: 'Launch', description: 'SYLFIRM X Plus KFDA 허가 완료 — 스마트 피드백 핸드피스 탑재 업그레이드 버전' },
      { date: '2025-03', type: 'Clinical', description: 'SYLFIRM X 로사세아·모세혈관 치료 RCT 결과 AAD 2025 발표 — PW 모드 유효성 확인' },
      { date: '2024-03', type: 'Award', description: 'AAD 2024 Best Innovator 수상' },
      { date: '2023-11', type: 'Clinical', description: 'SYLFIRM X 멜라즈마 RCT 결과 JDVD 게재' },
      { date: '2021-09', type: 'Launch', description: 'SYLFIRM X FDA 510(k) 클리어런스 획득' },
    ],
    confidence: { level: 'verified', source: 'DART 공시' },
  },
  {
    competitor_id: 'lutronic',
    company_name: 'Lutronic',
    company_name_ko: '루트로닉',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#84CC16',
    description: 'GENIUS(NeedleRF)·SPECTRA(Laser) 시리즈. 2024년 Hologic 인수.',
    markets: ['Korea', 'NA', 'SEA', 'EU', 'China'],
    // GENIUS = Fractional RF Microneedling (NeedleRF), SPECTRA XT = Q-switched Nd:YAG (Laser)
    // ULTRA = HIFU (루트로닉 ULTRA는 안면 HIFU 장비)
    device_categories: ['NeedleRF', 'Laser', 'HIFU'],
    positioning: { price_score: 6, tech_score: 7.5, revenue_m: 110 },
    products: [
      {
        product_name: 'GENIUS',
        category: 'NeedleRF',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Fractional RF Microneedling with real-time impedance monitoring',
          indications: ['Skin resurfacing', 'Acne scar', 'Skin tightening'],
          notes: 'Real-time impedance monitoring 특허 기술 탑재',
        },
      },
      {
        product_name: 'SPECTRA XT',
        category: 'Laser',
        launch_year: 2020,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE', 'KFDA'],
        specs: {
          energy_type: 'Q-switched Nd:YAG',
          wavelength_nm: [532, 1064],
          indications: ['Pigmentation', 'Tattoo removal', 'Skin rejuvenation (Laser Toning)'],
        },
      },
      {
        product_name: 'ULTRA',
        category: 'HIFU',
        launch_year: 2021,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-focused HIFU',
          indications: ['Face lifting', 'Skin tightening'],
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 72, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 88, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 103, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 108, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 110, source: 'DART 공시' },
    ],
    events: [
      { date: '2025-05', type: 'Launch', description: 'GENIUS Ultra CE 인증 — 딥러닝 기반 실시간 임피던스 피드백 NeedleRF 신규 플랫폼' },
      { date: '2025-02', type: 'MA', description: 'Hologic 인수 후 통합 완료 — Lutronic 브랜드 유지, 미국 직판 네트워크 본격 가동' },
      { date: '2024-05', type: 'MA', description: 'Hologic에 인수 완료 — 미국 시장 유통망 확대 기대' },
      { date: '2023-08', type: 'Launch', description: 'ULTRA 플랫폼 유럽 CE 획득' },
    ],
    confidence: { level: 'verified', source: 'DART 공시' },
  },
  {
    competitor_id: 'jeisys',
    company_name: 'Jeisys Medical',
    company_name_ko: '제이시스메디칼',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#14B8A6',
    description: 'DOUBLO(HIFU)·INTRACEL(NeedleRF)·PICOPLUS(Laser) 복합 라인업.',
    markets: ['Korea', 'SEA', 'EU', 'Others'],
    // DOUBLO = Micro-focused HIFU, INTRACEL = Fractional RF Microneedling (NeedleRF), PICOPLUS = Pico Laser
    // 수정: RF 제거 → HIFU + NeedleRF + Laser
    device_categories: ['HIFU', 'NeedleRF', 'Laser'],
    positioning: { price_score: 5.5, tech_score: 6.5, revenue_m: 82 },
    products: [
      {
        product_name: 'DOUBLO-S',
        category: 'HIFU',
        launch_year: 2020,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-focused HIFU',
          depth_mm: [3.0, 4.5],
          indications: ['Face lifting', 'Skin tightening'],
        },
      },
      {
        product_name: 'INTRACEL',
        category: 'NeedleRF',
        launch_year: 2012,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Fractional RF Microneedling (Bipolar, 1MHz)',
          indications: ['Skin resurfacing', 'Acne scar', 'Pore reduction'],
          notes: 'NeedleRF 분야 초기 개척 제품 중 하나',
        },
      },
      {
        product_name: 'PICOPLUS',
        category: 'Laser',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Picosecond Nd:YAG Laser',
          wavelength_nm: [532, 1064, 595, 660],
          indications: ['Pigmentation', 'Tattoo removal', 'Skin rejuvenation'],
          notes: '4파장 피코세컨드 레이저',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 54, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 65, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 76, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 80, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 82, source: 'DART 공시' },
    ],
    events: [
      { date: '2025-05', type: 'Partnership', description: '태국 방콕 직판 법인 설립 — 동남아 6개국 직접 공략 선언' },
      { date: '2025-03', type: 'Other', description: 'KIMES 2025 참가 — DOUBLO S Gold 신형 카트리지·PICOPLUS Boost 세계 최초 공개' },
      { date: '2024-03', type: 'Other', description: 'KIMES 2024 DOUBLO S 신형 공개' },
      { date: '2023-07', type: 'Partnership', description: '동남아 신규 딜러십 계약 5개국' },
    ],
    confidence: { level: 'verified', source: 'DART 공시' },
  },
  {
    competitor_id: 'wontech',
    company_name: 'Wontech',
    company_name_ko: '원텍',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#A78BFA',
    description: 'Oligio(RF 복합)·레이저 복합 포트폴리오. 국내 의원급 레이저 점유율 강세.',
    markets: ['Korea', 'SEA', 'Others'],
    // Oligio = Monopolar RF + Collimated HIFU (hybrid, but primarily RF-based lifting)
    // 원텍은 LASEMD(Thulium Laser), PICOHI(Pico Laser)도 보유 → Laser 추가
    device_categories: ['RF', 'HIFU', 'Laser'],
    positioning: { price_score: 5, tech_score: 6, revenue_m: 63 },
    products: [
      {
        product_name: 'Oligio',
        category: 'RF',
        launch_year: 2020,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Monopolar RF + CHRF (Collimated HIFU-RF hybrid)',
          indications: ['Face lifting', 'Skin tightening', 'Submental area'],
          notes: 'RF 기반 리프팅 — 순수 HIFU가 아닌 RF+초음파 복합 방식',
        },
      },
      {
        product_name: 'LASEMD Ultra',
        category: 'Laser',
        launch_year: 2020,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Thulium Fiber Laser (1927nm)',
          indications: ['Skin resurfacing', 'Pigmentation', 'Tone improvement'],
          notes: '툴리움 레이저 — 미백·피부 결 개선',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 38, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 48, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 57, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 62, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 63, source: 'DART 공시' },
    ],
    events: [
      { date: '2025-06', type: 'Partnership', description: '중국 에스테틱 파트너사 계약 — 중국 내수 클리닉 시장 첫 진입 선언' },
      { date: '2025-03', type: 'Launch', description: 'Oligio Prime KFDA 허가 획득 — RF+초음파 하이브리드 에너지 업그레이드 버전' },
      { date: '2024-03', type: 'Launch', description: 'Oligio Plus 개선 버전 KFDA 허가' },
      { date: '2023-06', type: 'Partnership', description: '태국·베트남 전담 딜러 계약' },
    ],
    confidence: { level: 'verified', source: 'DART 공시' },
  },
  {
    competitor_id: 'hironic',
    company_name: 'Hironic',
    company_name_ko: '하이로닉',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Tier2',
    color: '#FB7185',
    description: 'DOUBLO 브랜드 HIFU 전문기업. RF 복합 라인업 병행.',
    markets: ['Korea', 'SEA', 'Others'],
    // DOUBLO Gold/Silver = Micro-focused HIFU (하이로닉이 DOUBLO 원 브랜드 보유)
    // Winback = RF (448kHz INDIBA형)
    device_categories: ['HIFU', 'RF'],
    positioning: { price_score: 5, tech_score: 5.5, revenue_m: 52 },
    products: [
      {
        product_name: 'DOUBLO Gold',
        category: 'HIFU',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['CE', 'KFDA'],
        specs: {
          energy_type: 'Micro-focused HIFU (MFU)',
          depth_mm: [3.0, 4.5],
          indications: ['Face lifting', 'Neck tightening'],
          notes: '하이로닉 DOUBLO 브랜드 — 제이시스 DOUBLO와 상표 분쟁 이력',
        },
      },
      {
        product_name: 'Winback INTZA',
        category: 'RF',
        launch_year: 2021,
        price_tier: 'Mid',
        certifications: ['CE'],
        specs: {
          energy_type: 'Capacitive Resistive RF (448kHz INDIBA compatible)',
          indications: ['Skin rejuvenation', 'Anti-aging', 'Pain management'],
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 35, source: 'DART 공시' },
      { year: 2021, revenue_usd_m: 43, source: 'DART 공시' },
      { year: 2022, revenue_usd_m: 50, source: 'DART 공시' },
      { year: 2023, revenue_usd_m: 52, source: 'DART 공시' },
      { year: 2024, revenue_usd_m: 52, source: 'DART 공시' },
    ],
    events: [
      { date: '2025-06', type: 'Launch', description: 'Hi-HIFU Pro 유럽 CE 인증 획득 — 신형 HIFU 플랫폼으로 유럽 시장 본격 공략' },
      { date: '2025-03', type: 'Other', description: 'KIMES 2025 출전 — DOUBLO Gold S 신형 카트리지 및 복합 플랫폼 Hi-PRO 공개' },
      { date: '2024-03', type: 'Other', description: 'KIMES 2024 출품 — 복합 플랫폼 라인업 공개' },
    ],
    confidence: { level: 'verified', source: 'DART 공시' },
  },
  {
    competitor_id: 'asterasys',
    company_name: 'Asterasys',
    company_name_ko: '아스테라시스',
    hq_country: 'South Korea',
    hq_flag: '🇰🇷',
    tier: 'Emerging',
    color: '#34D399',
    description: '초절연침 NeedleRF 전문. 고성장 신흥 에스테틱 기기 기업.',
    markets: ['Korea', 'SEA'],
    // 아스테라시스는 NeedleRF 전문 — RF는 구동 에너지이나 별도 RF 전용 제품은 없음
    device_categories: ['NeedleRF'],
    positioning: { price_score: 6, tech_score: 7, revenue_m: 28 },
    products: [
      {
        product_name: 'AGNES RF',
        category: 'NeedleRF',
        launch_year: 2019,
        price_tier: 'Mid',
        certifications: ['KFDA', 'CE'],
        specs: {
          energy_type: 'Monopolar RF with ultra-fine insulated microneedle',
          indications: ['Acne treatment', 'Skin rejuvenation', 'Pore minimizing', 'Eye bag'],
          notes: '초미세 단극 절연침 RF — 정밀 타겟 치료',
        },
      },
      {
        product_name: 'MNRF PRO',
        category: 'NeedleRF',
        launch_year: 2022,
        price_tier: 'Mid',
        certifications: ['KFDA'],
        specs: {
          energy_type: 'Fractional RF Microneedling (bipolar, insulated)',
          indications: ['Skin resurfacing', 'Pore minimizing', 'Acne scar'],
          notes: '초절연침 기술 적용 MNRF',
        },
      },
    ],
    financials: [
      { year: 2021, revenue_usd_m: 10, source: '업계추정' },
      { year: 2022, revenue_usd_m: 18, source: '업계추정' },
      { year: 2023, revenue_usd_m: 24, source: '업계추정' },
      { year: 2024, revenue_usd_m: 28, source: '업계추정' },
    ],
    events: [
      { date: '2025-05', type: 'Other', description: 'FDA 510(k) 제출 완료 — AGNES RF 미국 시장 진입 승인 절차 시작' },
      { date: '2025-03', type: 'Launch', description: 'KIMES 2025 — AGNES RF Pro 세계 최초 공개. 다관절 핸드피스로 시술 접근성 대폭 향상' },
      { date: '2024-03', type: 'Other', description: 'KIMES 2024 첫 단독 부스 출전' },
      { date: '2023-05', type: 'Partnership', description: '동남아 첫 수출 딜러 계약' },
    ],
    confidence: { level: 'estimated', source: '업계추정' },
  },
  {
    competitor_id: 'deka',
    company_name: 'DEKA Medical',
    hq_country: 'Italy',
    hq_flag: '🇮🇹',
    tier: 'Tier2',
    color: '#E11D48',
    description: 'Onda Coolwaves(마이크로파 체형관리)·SmartXide DOT(CO2 레이저) 이탈리아 기반 의료 레이저 전문기업.',
    markets: ['EU', 'NA', 'SEA', 'Others'],
    device_categories: ['Laser', 'Body'],
    positioning: { price_score: 7, tech_score: 7, revenue_m: 65 },
    products: [
      {
        product_name: 'Onda Coolwaves',
        category: 'Body',
        launch_year: 2015,
        price_tier: 'Mid',
        certifications: ['CE'],
        specs: {
          energy_type: 'Microwave (Coolwaves, 2.45GHz)',
          indications: ['Body contouring', 'Cellulite treatment', 'Subcutaneous fat reduction'],
          notes: 'Coolwaves 마이크로파 기술 — RF·초음파와 다른 원리, 피부 냉각 병행',
        },
      },
      {
        product_name: 'SmartXide DOT',
        category: 'Laser',
        launch_year: 2010,
        price_tier: 'Mid',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Fractional CO2 Laser (10600nm)',
          indications: ['Skin resurfacing', 'Acne scar', 'Skin rejuvenation', 'Surgical'],
          notes: 'H-Pulse 기술 탑재 CO2 점배열 레이저',
        },
      },
      {
        product_name: 'SmartLipo MPX',
        category: 'Body',
        launch_year: 2009,
        price_tier: 'Premium',
        certifications: ['FDA', 'CE'],
        specs: {
          energy_type: 'Dual-wavelength Laser lipolysis (1064nm + 1320nm)',
          indications: ['Laser lipolysis', 'Body contouring', 'Skin tightening'],
          notes: '이중 파장 레이저 지방용해 (Laser Lipolysis) 전용',
        },
      },
    ],
    financials: [
      { year: 2020, revenue_usd_m: 50, source: '업계추정' },
      { year: 2021, revenue_usd_m: 56, source: '업계추정' },
      { year: 2022, revenue_usd_m: 60, source: '업계추정' },
      { year: 2023, revenue_usd_m: 63, source: '업계추정' },
      { year: 2024, revenue_usd_m: 65, source: '업계추정' },
    ],
    events: [
      { date: '2025-06', type: 'Launch', description: 'Onda 2세대 CE 인증 취득 — 마이크로파 파워 30% 강화, 지능형 냉각 시스템 도입' },
      { date: '2025-04', type: 'Other', description: 'ASLMS 2025 참가 — Onda Coolwaves 신규 체형 교정 임상 연구 결과 발표' },
      { date: '2024-05', type: 'Other', description: 'ASLMS 2024 Onda 최신 임상 데이터 발표' },
      { date: '2023-09', type: 'Launch', description: 'SmartXide Touch CO2 시스템 CE 인증' },
      { date: '2022-11', type: 'Clinical', description: 'Onda Coolwaves 셀룰라이트 임상 JDDG 게재' },
    ],
    confidence: { level: 'estimated', source: '업계추정' },
  },
]
