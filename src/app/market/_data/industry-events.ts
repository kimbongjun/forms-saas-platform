export type IndustryEventCategory = 'aesthetics' | 'dermatology' | 'laser' | 'mixed'
export type IndustryEventRegion = 'Korea' | 'NA' | 'EU' | 'SEA' | 'Others'

export interface IndustryEvent {
  id: string
  name: string
  full_name: string
  year: number
  month: number // 1–12
  date_label: string // "YYYY-MM-DD~DD" 형식 표시용
  location: string
  country_flag: string
  region: IndustryEventRegion
  category: IndustryEventCategory
  url?: string
}

export const INDUSTRY_EVENTS: IndustryEvent[] = [
  // ── 2025 ──────────────────────────────────────────────────────────────────
  {
    id: 'imcas-world-2025',
    name: 'IMCAS World',
    full_name: "Int'l Master Course on Aging Skin",
    year: 2025, month: 1, date_label: '2025-01-30~02-01',
    location: 'Paris', country_flag: '🇫🇷', region: 'EU', category: 'aesthetics',
    url: 'https://www.imcas.com',
  },
  {
    id: 'aad-2025',
    name: 'AAD 2025',
    full_name: 'American Academy of Dermatology Annual Meeting',
    year: 2025, month: 3, date_label: '2025-03-07~11',
    location: 'San Diego, CA', country_flag: '🇺🇸', region: 'NA', category: 'dermatology',
  },
  {
    id: 'kimes-2025',
    name: 'KIMES 2025',
    full_name: '국제의료기기·병원설비전시회',
    year: 2025, month: 3, date_label: '2025-03-13~16',
    location: '서울 COEX', country_flag: '🇰🇷', region: 'Korea', category: 'mixed',
  },
  {
    id: 'amwc-2025',
    name: 'AMWC 2025',
    full_name: 'Aesthetic & Anti-Aging Medicine World Congress',
    year: 2025, month: 4, date_label: '2025-04-10~12',
    location: 'Monaco', country_flag: '🇲🇨', region: 'EU', category: 'aesthetics',
  },
  {
    id: 'aslms-2025',
    name: 'ASLMS 2025',
    full_name: 'American Society for Laser Medicine & Surgery',
    year: 2025, month: 4, date_label: '2025-04-11~13',
    location: 'Denver, CO', country_flag: '🇺🇸', region: 'NA', category: 'laser',
  },
  {
    id: 'aw-2025',
    name: 'Aesthetic World 2025',
    full_name: 'Ästhetische Medizin Kongress',
    year: 2025, month: 5, date_label: '2025-05-08~10',
    location: 'Frankfurt', country_flag: '🇩🇪', region: 'EU', category: 'aesthetics',
  },
  {
    id: 'imcas-asia-2025',
    name: 'IMCAS Asia 2025',
    full_name: 'IMCAS Asia Congress',
    year: 2025, month: 7, date_label: '2025-07-18~20',
    location: 'Seoul', country_flag: '🇰🇷', region: 'Korea', category: 'aesthetics',
  },
  {
    id: 'asds-2025',
    name: 'ASDS 2025',
    full_name: 'American Society for Dermatologic Surgery',
    year: 2025, month: 10, date_label: '2025-10-09~12',
    location: 'Nashville, TN', country_flag: '🇺🇸', region: 'NA', category: 'dermatology',
  },
  {
    id: 'eadv-2025',
    name: 'EADV 2025',
    full_name: 'European Academy of Dermatology & Venereology',
    year: 2025, month: 10, date_label: '2025-10-22~25',
    location: 'Amsterdam', country_flag: '🇳🇱', region: 'EU', category: 'dermatology',
  },
  {
    id: 'wclad-2025',
    name: 'WCLAD 2025',
    full_name: 'World Congress of Laser & Aesthetic Dermatology',
    year: 2025, month: 11, date_label: '2025-11-14~16',
    location: 'Seoul', country_flag: '🇰🇷', region: 'Korea', category: 'laser',
  },

  // ── 2026 ──────────────────────────────────────────────────────────────────
  {
    id: 'imcas-world-2026',
    name: 'IMCAS World',
    full_name: "Int'l Master Course on Aging Skin",
    year: 2026, month: 1, date_label: '2026-01-29~31',
    location: 'Paris', country_flag: '🇫🇷', region: 'EU', category: 'aesthetics',
    url: 'https://www.imcas.com',
  },
  {
    id: 'aad-2026',
    name: 'AAD 2026',
    full_name: 'American Academy of Dermatology Annual Meeting',
    year: 2026, month: 3, date_label: '2026-03-20~24',
    location: 'New York, NY', country_flag: '🇺🇸', region: 'NA', category: 'dermatology',
  },
  {
    id: 'kimes-2026',
    name: 'KIMES 2026',
    full_name: '국제의료기기·병원설비전시회',
    year: 2026, month: 3, date_label: '2026-03-12~15',
    location: '서울 COEX', country_flag: '🇰🇷', region: 'Korea', category: 'mixed',
  },
  {
    id: 'amwc-2026',
    name: 'AMWC 2026',
    full_name: 'Aesthetic & Anti-Aging Medicine World Congress',
    year: 2026, month: 4, date_label: '2026-04-02~04',
    location: 'Monaco', country_flag: '🇲🇨', region: 'EU', category: 'aesthetics',
  },
  {
    id: 'aslms-2026',
    name: 'ASLMS 2026',
    full_name: 'American Society for Laser Medicine & Surgery',
    year: 2026, month: 4, date_label: '2026-04-17~19',
    location: 'San Diego, CA', country_flag: '🇺🇸', region: 'NA', category: 'laser',
  },
  {
    id: 'aw-2026',
    name: 'Aesthetic World 2026',
    full_name: 'Ästhetische Medizin Kongress',
    year: 2026, month: 5, date_label: '2026-05-14~16',
    location: 'Frankfurt', country_flag: '🇩🇪', region: 'EU', category: 'aesthetics',
  },
  {
    id: 'imcas-asia-2026',
    name: 'IMCAS Asia 2026',
    full_name: 'IMCAS Asia Congress',
    year: 2026, month: 7, date_label: '2026-07-17~19',
    location: 'Bangkok', country_flag: '🇹🇭', region: 'SEA', category: 'aesthetics',
  },
  {
    id: 'asds-2026',
    name: 'ASDS 2026',
    full_name: 'American Society for Dermatologic Surgery',
    year: 2026, month: 10, date_label: '2026-10-08~11',
    location: 'Chicago, IL', country_flag: '🇺🇸', region: 'NA', category: 'dermatology',
  },
  {
    id: 'eadv-2026',
    name: 'EADV 2026',
    full_name: 'European Academy of Dermatology & Venereology',
    year: 2026, month: 10, date_label: '2026-10-14~17',
    location: 'Vienna', country_flag: '🇦🇹', region: 'EU', category: 'dermatology',
  },
]
