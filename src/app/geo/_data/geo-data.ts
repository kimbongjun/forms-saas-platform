// GEO/AEO 경쟁 인텔리전스 데이터 — 2026 스냅샷
// 대상: 볼뉴머(base), 써마지, 덴서티, 올리지오, 텐써마, XERF, 울쎄라, 슈링크

export const GEO_BRANDS = ['볼뉴머', '써마지', '덴서티', '올리지오', '텐써마', 'XERF', '울쎄라', '슈링크'] as const
export type GeoBrand = (typeof GEO_BRANDS)[number]

export interface TechAeo {
  schema_types: string[]
  faq_schema: boolean
  eeeat_score: number
  lcp_ms: number
  cls: number
  mobile_score: number
  https: boolean
  sitemap: boolean
  checked_at: string
}

export interface AuthoritySource {
  name: string
  type: 'wikipedia' | 'namuwiki' | 'medical_journal' | 'news' | 'government'
  exists: boolean
  last_updated?: string
  url?: string
}

export interface Authority {
  sources: AuthoritySource[]
  citation_count_2025: number
  citation_count_2026: number
  citation_growth_pct: number
  domain_authority: number
  authority_score: number
}

export interface AeoBenchmark {
  chatgpt_mentions: number
  gemini_mentions: number
  claude_mentions: number
  perplexity_mentions: number
  google_sge_featured: boolean
  avg_rank: number
  sample_queries: Array<{ query: string; mentioned: boolean; rank?: number }>
  visibility_score: number
  checked_at: string
}

export interface Community {
  babytalk_monthly: number
  gangnam_unni_monthly: number
  blog_monthly: number
  youtube_monthly: number
  total_monthly_mentions: number
  sentiment_positive_pct: number
  share_of_voice_pct: number
  trending_keywords: string[]
  community_score: number
}

export interface EarnedMedia {
  press_releases_2025: number
  press_releases_2026: number
  academic_papers_2025: number
  academic_papers_2026: number
  seminar_talks: number
  citation_growth_pct: number
  notable_citations: Array<{ title: string; journal: string; year: number; impact_factor?: number; url?: string }>
  media_score: number
}

export interface BrandGeoData {
  id: string
  name: string
  name_en: string
  company: string
  color: string
  device_type: string
  geo_score: number
  youtube_query: string
  tech: TechAeo
  authority: Authority
  aeo: AeoBenchmark
  community: Community
  earned_media: EarnedMedia
}

export const GEO_DATA: BrandGeoData[] = [
  // ─── 볼뉴머 (Classys — base brand) ────────────────────────────────────────
  {
    id: 'volnewmer',
    name: '볼뉴머',
    name_en: 'Volnewmer',
    company: 'Classys',
    color: '#B4221B',
    device_type: 'Monopolar RF',
    geo_score: 62,
    youtube_query: '볼뉴머 리프팅 시술',
    tech: {
      schema_types: ['Product', 'FAQPage', 'Organization'],
      faq_schema: true,
      eeeat_score: 60,
      lcp_ms: 2600,
      cls: 0.14,
      mobile_score: 80,
      https: true,
      sitemap: true,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: false },
        { name: '나무위키', type: 'namuwiki', exists: true, last_updated: '2026-01-20' },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: '대한피부과학회', type: 'medical_journal', exists: true },
        { name: '국내 뷰티 언론', type: 'news', exists: true },
      ],
      citation_count_2025: 22,
      citation_count_2026: 28,
      citation_growth_pct: 27.3,
      domain_authority: 58,
      authority_score: 60,
    },
    aeo: {
      chatgpt_mentions: 4,
      gemini_mentions: 5,
      claude_mentions: 4,
      perplexity_mentions: 4,
      google_sge_featured: false,
      avg_rank: 3.0,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: true, rank: 4 },
        { query: '모노폴라 RF 비교', mentioned: true, rank: 3 },
        { query: '피부 탄력 개선 시술', mentioned: true, rank: 4 },
        { query: '고주파 리프팅 차이', mentioned: false },
        { query: '통증 없는 리프팅', mentioned: true, rank: 3 },
      ],
      visibility_score: 55,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 680,
      gangnam_unni_monthly: 520,
      blog_monthly: 310,
      youtube_monthly: 28,
      total_monthly_mentions: 1538,
      sentiment_positive_pct: 70,
      share_of_voice_pct: 22,
      trending_keywords: ['볼뉴머 후기', '클래시스', '모노폴라 RF', '써마지 비교', '가격'],
      community_score: 58,
    },
    earned_media: {
      press_releases_2025: 9,
      press_releases_2026: 3,
      academic_papers_2025: 5,
      academic_papers_2026: 2,
      seminar_talks: 4,
      citation_growth_pct: 27.3,
      notable_citations: [
        { title: 'Volnewmer 모노폴라 RF 임상 효과 및 안전성 연구', journal: '대한피부과학회지', year: 2026, impact_factor: 1.8 },
        { title: 'Comparison of monopolar RF devices in skin tightening', journal: 'J Cosmetic Dermatology', year: 2025, impact_factor: 3.1 },
      ],
      media_score: 62,
    },
  },

  // ─── 써마지 ────────────────────────────────────────────────────────────────
  {
    id: 'thermage',
    name: '써마지',
    name_en: 'Thermage',
    company: 'Solta Medical',
    color: '#59004F',
    device_type: 'Monopolar RF',
    geo_score: 82,
    youtube_query: '써마지 FLX 리프팅 효과',
    tech: {
      schema_types: ['MedicalProcedure', 'Product', 'FAQPage', 'Organization', 'BreadcrumbList'],
      faq_schema: true,
      eeeat_score: 78,
      lcp_ms: 2100,
      cls: 0.08,
      mobile_score: 87,
      https: true,
      sitemap: true,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: true, last_updated: '2026-03-18' },
        { name: '나무위키', type: 'namuwiki', exists: true, last_updated: '2026-04-02' },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: 'Journal of Dermatology', type: 'medical_journal', exists: true },
        { name: 'KNN·MBC 뉴스', type: 'news', exists: true },
      ],
      citation_count_2025: 45,
      citation_count_2026: 52,
      citation_growth_pct: 15.6,
      domain_authority: 76,
      authority_score: 80,
    },
    aeo: {
      chatgpt_mentions: 8,
      gemini_mentions: 7,
      claude_mentions: 7,
      perplexity_mentions: 8,
      google_sge_featured: true,
      avg_rank: 1.8,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: true, rank: 1 },
        { query: '모노폴라 RF 비교', mentioned: true, rank: 1 },
        { query: '피부 탄력 개선 시술', mentioned: true, rank: 2 },
        { query: '고주파 리프팅 차이', mentioned: true, rank: 1 },
        { query: '통증 없는 리프팅', mentioned: true, rank: 2 },
      ],
      visibility_score: 82,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 1240,
      gangnam_unni_monthly: 890,
      blog_monthly: 560,
      youtube_monthly: 45,
      total_monthly_mentions: 2735,
      sentiment_positive_pct: 71,
      share_of_voice_pct: 38,
      trending_keywords: ['써마지 FLX', '1회 시술', '통증', '가격', '리프팅 지속'],
      community_score: 78,
    },
    earned_media: {
      press_releases_2025: 12,
      press_releases_2026: 4,
      academic_papers_2025: 8,
      academic_papers_2026: 3,
      seminar_talks: 6,
      citation_growth_pct: 15.6,
      notable_citations: [
        { title: 'Long-term efficacy of monopolar RF for facial skin tightening', journal: 'Dermatologic Surgery', year: 2026, impact_factor: 4.2 },
        { title: '써마지 FLX 임상 효과 비교 연구', journal: '대한피부과학회지', year: 2025, impact_factor: 1.8 },
        { title: 'Radiofrequency devices in aesthetic medicine: 2026 update', journal: 'J Cosmetic Dermatology', year: 2026, impact_factor: 3.1 },
      ],
      media_score: 82,
    },
  },

  // ─── 덴서티 ────────────────────────────────────────────────────────────────
  {
    id: 'densiti',
    name: '덴서티',
    name_en: 'Densiti',
    company: 'Denox',
    color: '#0C3A47',
    device_type: 'Bipolar RF',
    geo_score: 58,
    youtube_query: '덴서티 RF 피부 리프팅',
    tech: {
      schema_types: ['Product', 'WebPage'],
      faq_schema: false,
      eeeat_score: 55,
      lcp_ms: 3200,
      cls: 0.18,
      mobile_score: 72,
      https: true,
      sitemap: true,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: false },
        { name: '나무위키', type: 'namuwiki', exists: false },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: 'KJD (대한피부과학회)', type: 'medical_journal', exists: true },
        { name: '뷰티 미디어 기사', type: 'news', exists: true },
      ],
      citation_count_2025: 12,
      citation_count_2026: 15,
      citation_growth_pct: 25.0,
      domain_authority: 44,
      authority_score: 52,
    },
    aeo: {
      chatgpt_mentions: 4,
      gemini_mentions: 4,
      claude_mentions: 3,
      perplexity_mentions: 4,
      google_sge_featured: false,
      avg_rank: 3.2,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: false },
        { query: '모노폴라 RF 비교', mentioned: true, rank: 4 },
        { query: '피부 탄력 개선 시술', mentioned: false },
        { query: '고주파 리프팅 차이', mentioned: true, rank: 3 },
        { query: '통증 없는 리프팅', mentioned: false },
      ],
      visibility_score: 48,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 540,
      gangnam_unni_monthly: 380,
      blog_monthly: 210,
      youtube_monthly: 18,
      total_monthly_mentions: 1148,
      sentiment_positive_pct: 65,
      share_of_voice_pct: 15,
      trending_keywords: ['덴서티 효과', '가격 비교', '부작용', 'RF 차이'],
      community_score: 52,
    },
    earned_media: {
      press_releases_2025: 5,
      press_releases_2026: 2,
      academic_papers_2025: 2,
      academic_papers_2026: 1,
      seminar_talks: 2,
      citation_growth_pct: 25.0,
      notable_citations: [
        { title: 'Bipolar RF 임상 효과 연구', journal: '대한피부과학회지', year: 2025, impact_factor: 1.8 },
      ],
      media_score: 55,
    },
  },

  // ─── 올리지오 ───────────────────────────────────────────────────────────────
  {
    id: 'oligio',
    name: '올리지오',
    name_en: 'Oligio',
    company: '원텍',
    color: '#7954C0',
    device_type: 'RF + HIFU Hybrid',
    geo_score: 65,
    youtube_query: '올리지오 리프팅 시술 후기',
    tech: {
      schema_types: ['Product', 'FAQPage', 'MedicalProcedure'],
      faq_schema: true,
      eeeat_score: 62,
      lcp_ms: 2800,
      cls: 0.12,
      mobile_score: 78,
      https: true,
      sitemap: true,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: false },
        { name: '나무위키', type: 'namuwiki', exists: true, last_updated: '2026-02-14' },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: '대한피부과학회', type: 'medical_journal', exists: true },
        { name: 'YTN·채널A 등 방송', type: 'news', exists: true },
      ],
      citation_count_2025: 18,
      citation_count_2026: 24,
      citation_growth_pct: 33.3,
      domain_authority: 52,
      authority_score: 62,
    },
    aeo: {
      chatgpt_mentions: 5,
      gemini_mentions: 6,
      claude_mentions: 4,
      perplexity_mentions: 5,
      google_sge_featured: false,
      avg_rank: 2.6,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: true, rank: 3 },
        { query: '모노폴라 RF 비교', mentioned: true, rank: 2 },
        { query: '피부 탄력 개선 시술', mentioned: true, rank: 3 },
        { query: '고주파 리프팅 차이', mentioned: false },
        { query: '통증 없는 리프팅', mentioned: true, rank: 4 },
      ],
      visibility_score: 62,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 980,
      gangnam_unni_monthly: 720,
      blog_monthly: 420,
      youtube_monthly: 38,
      total_monthly_mentions: 2158,
      sentiment_positive_pct: 68,
      share_of_voice_pct: 28,
      trending_keywords: ['올리지오 후기', 'RF HIFU 차이', '가격', '원텍', '회사'],
      community_score: 68,
    },
    earned_media: {
      press_releases_2025: 8,
      press_releases_2026: 3,
      academic_papers_2025: 4,
      academic_papers_2026: 2,
      seminar_talks: 4,
      citation_growth_pct: 33.3,
      notable_citations: [
        { title: 'Oligio RF+HIFU 복합 시술 효과 비교', journal: '대한미용성형외과학회지', year: 2026, impact_factor: 1.4 },
        { title: 'RF hybrid device clinical outcomes', journal: 'Aesthetic Surgery Journal', year: 2025, impact_factor: 4.5 },
      ],
      media_score: 62,
    },
  },

  // ─── 텐써마 ─────────────────────────────────────────────────────────────────
  {
    id: 'tenthermo',
    name: '텐써마',
    name_en: 'TenTherma',
    company: 'Tera Bio',
    color: '#33348D',
    device_type: 'Capacitive RF',
    geo_score: 48,
    youtube_query: '텐써마 고주파 피부과',
    tech: {
      schema_types: ['Product'],
      faq_schema: false,
      eeeat_score: 48,
      lcp_ms: 3800,
      cls: 0.22,
      mobile_score: 65,
      https: true,
      sitemap: false,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: false },
        { name: '나무위키', type: 'namuwiki', exists: false },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: '의학 학술지', type: 'medical_journal', exists: false },
        { name: '뷰티 블로그', type: 'news', exists: true },
      ],
      citation_count_2025: 8,
      citation_count_2026: 9,
      citation_growth_pct: 12.5,
      domain_authority: 36,
      authority_score: 42,
    },
    aeo: {
      chatgpt_mentions: 3,
      gemini_mentions: 3,
      claude_mentions: 2,
      perplexity_mentions: 3,
      google_sge_featured: false,
      avg_rank: 3.8,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: false },
        { query: '모노폴라 RF 비교', mentioned: false },
        { query: '피부 탄력 개선 시술', mentioned: true, rank: 5 },
        { query: '고주파 리프팅 차이', mentioned: false },
        { query: '통증 없는 리프팅', mentioned: true, rank: 4 },
      ],
      visibility_score: 35,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 380,
      gangnam_unni_monthly: 250,
      blog_monthly: 140,
      youtube_monthly: 12,
      total_monthly_mentions: 782,
      sentiment_positive_pct: 62,
      share_of_voice_pct: 11,
      trending_keywords: ['텐써마 효과', '가격', '써마지 비교'],
      community_score: 40,
    },
    earned_media: {
      press_releases_2025: 4,
      press_releases_2026: 1,
      academic_papers_2025: 1,
      academic_papers_2026: 0,
      seminar_talks: 1,
      citation_growth_pct: 12.5,
      notable_citations: [],
      media_score: 38,
    },
  },

  // ─── XERF ─────────────────────────────────────────────────────────────────
  {
    id: 'xerf',
    name: 'XERF',
    name_en: 'XERF',
    company: 'XR Aesthetics',
    color: '#F37964',
    device_type: 'Fractional RF',
    geo_score: 41,
    youtube_query: 'XERF 분할 RF 리프팅',
    tech: {
      schema_types: [],
      faq_schema: false,
      eeeat_score: 35,
      lcp_ms: 4500,
      cls: 0.28,
      mobile_score: 58,
      https: true,
      sitemap: false,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: false },
        { name: '나무위키', type: 'namuwiki', exists: false },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: '의학 학술지', type: 'medical_journal', exists: false },
        { name: '미디어', type: 'news', exists: false },
      ],
      citation_count_2025: 4,
      citation_count_2026: 6,
      citation_growth_pct: 50.0,
      domain_authority: 28,
      authority_score: 32,
    },
    aeo: {
      chatgpt_mentions: 2,
      gemini_mentions: 2,
      claude_mentions: 1,
      perplexity_mentions: 2,
      google_sge_featured: false,
      avg_rank: 4.5,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: false },
        { query: '모노폴라 RF 비교', mentioned: false },
        { query: '피부 탄력 개선 시술', mentioned: false },
        { query: '고주파 리프팅 차이', mentioned: false },
        { query: '통증 없는 리프팅', mentioned: true, rank: 5 },
      ],
      visibility_score: 25,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 210,
      gangnam_unni_monthly: 140,
      blog_monthly: 65,
      youtube_monthly: 6,
      total_monthly_mentions: 421,
      sentiment_positive_pct: 58,
      share_of_voice_pct: 7,
      trending_keywords: ['XERF 후기', '신규 기기'],
      community_score: 32,
    },
    earned_media: {
      press_releases_2025: 2,
      press_releases_2026: 1,
      academic_papers_2025: 0,
      academic_papers_2026: 0,
      seminar_talks: 0,
      citation_growth_pct: 50.0,
      notable_citations: [],
      media_score: 28,
    },
  },

  // ─── 울쎄라 ───────────────────────────────────────────────────────────────
  {
    id: 'ulthera',
    name: '울쎄라',
    name_en: 'Ulthera',
    company: 'Merz Aesthetics',
    color: '#E8B02F',
    device_type: 'MFU-V (HIFU)',
    geo_score: 74,
    youtube_query: '울쎄라 HIFU 리프팅 시술',
    tech: {
      schema_types: ['MedicalProcedure', 'Product', 'FAQPage', 'Organization', 'BreadcrumbList'],
      faq_schema: true,
      eeeat_score: 72,
      lcp_ms: 1900,
      cls: 0.07,
      mobile_score: 90,
      https: true,
      sitemap: true,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (영문)', type: 'wikipedia', exists: true, last_updated: '2026-02-10' },
        { name: '나무위키', type: 'namuwiki', exists: true, last_updated: '2026-03-05' },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: 'JAAD · Dermatologic Surgery', type: 'medical_journal', exists: true },
        { name: 'KBS·SBS·MBC 뉴스', type: 'news', exists: true },
      ],
      citation_count_2025: 38,
      citation_count_2026: 44,
      citation_growth_pct: 15.8,
      domain_authority: 70,
      authority_score: 74,
    },
    aeo: {
      chatgpt_mentions: 7,
      gemini_mentions: 7,
      claude_mentions: 6,
      perplexity_mentions: 7,
      google_sge_featured: true,
      avg_rank: 2.2,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: true, rank: 2 },
        { query: 'HIFU 시술 비교', mentioned: true, rank: 1 },
        { query: '피부 탄력 개선 시술', mentioned: true, rank: 2 },
        { query: '초음파 리프팅 차이', mentioned: true, rank: 1 },
        { query: '통증 없는 리프팅', mentioned: true, rank: 3 },
      ],
      visibility_score: 76,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 1100,
      gangnam_unni_monthly: 820,
      blog_monthly: 480,
      youtube_monthly: 42,
      total_monthly_mentions: 2442,
      sentiment_positive_pct: 73,
      share_of_voice_pct: 32,
      trending_keywords: ['울쎄라 후기', 'HIFU 비교', '슈링크 차이', '가격', '멀츠'],
      community_score: 68,
    },
    earned_media: {
      press_releases_2025: 10,
      press_releases_2026: 3,
      academic_papers_2025: 7,
      academic_papers_2026: 3,
      seminar_talks: 7,
      citation_growth_pct: 15.8,
      notable_citations: [
        { title: 'Ultherapy for facial skin lifting: 5-year follow-up study', journal: 'Dermatologic Surgery', year: 2026, impact_factor: 4.2 },
        { title: 'MFU-V 임상 효과 및 안전성 장기 추적', journal: '대한피부과학회지', year: 2025, impact_factor: 1.8 },
        { title: 'Comparative study of HIFU devices in facial rejuvenation', journal: 'J Cosmetic Dermatology', year: 2026, impact_factor: 3.1 },
      ],
      media_score: 72,
    },
  },

  // ─── 슈링크 ───────────────────────────────────────────────────────────────
  {
    id: 'shrink',
    name: '슈링크',
    name_en: 'Shurink Universe',
    company: '클래시스',
    color: '#182D60',
    device_type: 'HIFU',
    geo_score: 69,
    youtube_query: '슈링크 유니버스 HIFU 리프팅',
    tech: {
      schema_types: ['Product', 'FAQPage', 'Organization', 'MedicalProcedure'],
      faq_schema: true,
      eeeat_score: 65,
      lcp_ms: 2400,
      cls: 0.10,
      mobile_score: 83,
      https: true,
      sitemap: true,
      checked_at: '2026-05-12',
    },
    authority: {
      sources: [
        { name: 'Wikipedia (한국어)', type: 'wikipedia', exists: false },
        { name: '나무위키', type: 'namuwiki', exists: true, last_updated: '2026-04-10' },
        { name: '식품의약품안전처', type: 'government', exists: true },
        { name: '대한피부과학회', type: 'medical_journal', exists: true },
        { name: 'TV조선·채널A', type: 'news', exists: true },
      ],
      citation_count_2025: 26,
      citation_count_2026: 33,
      citation_growth_pct: 26.9,
      domain_authority: 55,
      authority_score: 64,
    },
    aeo: {
      chatgpt_mentions: 6,
      gemini_mentions: 6,
      claude_mentions: 5,
      perplexity_mentions: 6,
      google_sge_featured: false,
      avg_rank: 2.5,
      sample_queries: [
        { query: '리프팅 시술 추천', mentioned: true, rank: 3 },
        { query: 'HIFU 시술 비교', mentioned: true, rank: 2 },
        { query: '피부 탄력 개선 시술', mentioned: true, rank: 3 },
        { query: '초음파 리프팅 차이', mentioned: true, rank: 2 },
        { query: '통증 없는 리프팅', mentioned: true, rank: 4 },
      ],
      visibility_score: 68,
      checked_at: '2026-05-12',
    },
    community: {
      babytalk_monthly: 1050,
      gangnam_unni_monthly: 760,
      blog_monthly: 440,
      youtube_monthly: 35,
      total_monthly_mentions: 2285,
      sentiment_positive_pct: 72,
      share_of_voice_pct: 30,
      trending_keywords: ['슈링크 후기', '슈링크유니버스', '울쎄라 차이', '가격', 'HIFU 추천'],
      community_score: 72,
    },
    earned_media: {
      press_releases_2025: 7,
      press_releases_2026: 3,
      academic_papers_2025: 4,
      academic_papers_2026: 2,
      seminar_talks: 5,
      citation_growth_pct: 26.9,
      notable_citations: [
        { title: '슈링크 HIFU 임상 효과 다기관 연구', journal: '대한미용성형외과학회지', year: 2026, impact_factor: 1.4 },
        { title: 'High-intensity focused ultrasound for skin tightening in Asian patients', journal: 'Aesthetic Surgery Journal', year: 2025, impact_factor: 4.5 },
      ],
      media_score: 65,
    },
  },
]

export function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 55) return '#F59E0B'
  return '#EF4444'
}

export const DIMENSION_WEIGHTS = {
  tech: 0.2,
  authority: 0.25,
  aeo: 0.3,
  community: 0.15,
  media: 0.1,
}

export const DIMENSION_LABELS = [
  { key: 'tech', label: 'Tech·AEO', color: '#3B82F6' },
  { key: 'authority', label: '지식소스', color: '#10B981' },
  { key: 'aeo', label: 'AI 노출', color: '#8B5CF6' },
  { key: 'community', label: '커뮤니티', color: '#F59E0B' },
  { key: 'media', label: '미디어', color: '#EC4899' },
]

export const SAMPLE_QUERIES = [
  '리프팅 시술 추천해줘',
  '모노폴라 RF 기기 비교해줘',
  '얼굴 탄력 개선 시술 뭐가 좋아?',
  '써마지 vs 올리지오 차이는?',
  '피부과 리프팅 시술 종류',
]

export const PERSPECTIVES = [
  { value: 'general', label: '일반 소비자', desc: '뷰티/시술 비전문가, 30~40대' },
  { value: 'young', label: '20대 직장인', desc: '첫 리프팅 시술 고려 중' },
  { value: 'medical', label: '피부과 원장', desc: '장비 도입 검토 의사결정자' },
]
