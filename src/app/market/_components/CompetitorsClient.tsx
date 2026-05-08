'use client'

import { useState } from 'react'
import {
  ArrowUpRight, Building2, ChevronDown, ChevronUp, Globe2,
  Heart, Monitor, PlayCircle, Radar, ShieldCheck, Sparkles, Star,
  TrendingUp, Users,
} from 'lucide-react'
import MarketNav from './MarketNav'

type Region = 'korea' | 'global'
type Segment = 'hifu-rf' | 'laser' | 'injectables' | 'platform'
type Indication = 'lifting' | 'skincare' | 'body' | 'pigmentation' | 'hair-removal'
type AmbassadorType = 'celebrity' | 'influencer' | 'kol' | 'doctor'
type MarketingType = 'congress' | 'campaign' | 'education' | 'influencer' | 'social' | 'pr'

type Competitor = {
  id: string
  name: string
  isOwnCompany?: boolean
  region: Region
  segment: Segment
  indications: Indication[]
  country: string
  positioning: string
  recentDevices: { name: string; year: number; category: string; description: string; isNew?: boolean }[]
  trends: string[]
  marketing: { type: MarketingType; name: string; description: string; date?: string }[]
  events: { name: string; year: number; role: 'exhibitor' | 'sponsor' | 'speaker' }[]
  campaigns: { name: string; type: string; description: string; year?: number }[]
  ambassadors: { name: string; type: AmbassadorType; description: string; platform?: string }[]
  social: {
    youtubeChannelUrl?: string
    youtubeVideoId?: string
    instagramHandle?: string
    instagramUrl?: string
    websiteUrl: string
  }
  benchmark: {
    portfolioBreadth: number
    premiumPower: number
    globalScale: number
    trainingStrength: number
    innovationSpeed: number
    socialPresence: number
  }
}

const SEGMENT_LABELS: Record<Segment, string> = {
  'hifu-rf': 'HIFU / RF',
  laser: 'Laser',
  injectables: 'Injectables',
  platform: 'Multi-Platform',
}

const INDICATION_LABELS: Record<Indication, string> = {
  lifting: '리프팅',
  skincare: '스킨케어',
  body: '바디',
  pigmentation: '색소',
  'hair-removal': '제모',
}

const SEGMENT_ACCENT: Record<Segment, { bg: string; text: string; border: string }> = {
  'hifu-rf':    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  laser:        { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  injectables:  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
  platform:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
}

const COMPETITORS: Competitor[] = [
  {
    id: 'classys',
    name: 'CLASSYS (클래시스)',
    isOwnCompany: true,
    region: 'korea',
    segment: 'hifu-rf',
    indications: ['lifting', 'skincare', 'body'],
    country: 'South Korea',
    positioning: '슈링크·울트라포머 MPT로 국내 HIFU 시장점유율 1위를 유지하는 클래시스. 80개국 이상 수출 네트워크와 KOSDAQ 상장을 기반으로 프리미엄 에너지 기반 장비 글로벌 리더 포지셔닝 강화 중.',
    recentDevices: [
      { name: 'Ultraformer MPT', year: 2024, category: 'HIFU', description: 'Multi-Point Technology 탑재 3세대 울트라포머. 조사 속도 기존 대비 50% 향상, 3·4·5·7mm 카트리지 통합 지원.', isNew: true },
      { name: 'Shurink Universe', year: 2023, category: 'HIFU', description: '슈링크 3세대. 단일 세션 고밀도 조사 최적화, 국내 1회성 리프팅 시술 시장 점유율 1위 제품군.' },
      { name: 'VOLNEWMER', year: 2024, category: 'RF Microneedling', description: '고주파 마이크로니들링 플랫폼, RF 세그먼트 포트폴리오 확장 신호탄.', isNew: true },
    ],
    trends: [
      '슈링크 브랜드를 소비자 인지 "시술명"으로 안착 → 병원 방문 동기 직접 유발',
      '울트라포머 MPT로 HIFU 프리미엄 세그먼트 재정의, 경쟁사 대비 1.5–2배 가격 포지셔닝',
      'KOSDAQ 상장 이후 해외 직판 법인 확대 및 글로벌 KOL 교육 투자 증가',
    ],
    marketing: [
      { type: 'education', name: 'CLASSYS Academy', description: '국내외 의사 대상 핸즈온 교육 프로그램, 연 5,000명 이상 수료. 서울·싱가포르·두바이 거점.' },
      { type: 'congress', name: 'IMCAS / AMWC 주요 참여', description: '유럽 3대 미용의학 학회 메인 전시 및 임상 데이터 발표 지속.' },
      { type: 'social', name: '슈링크 KOL 콘텐츠 마케팅', description: '국내 피부과·성형외과 전문의 인스타그램 협업 콘텐츠, 슈링크 시술명 인지도 1위 유지.' },
    ],
    events: [
      { name: 'IMCAS World Congress', year: 2025, role: 'exhibitor' },
      { name: 'AMWC Monaco', year: 2025, role: 'exhibitor' },
      { name: 'KDA Spring Meeting', year: 2025, role: 'sponsor' },
      { name: 'AESOPH', year: 2025, role: 'sponsor' },
    ],
    campaigns: [
      { name: '슈링크 Universe 론칭', type: '국내 런칭', description: '국내 주요 100개 피부과 동시 도입 캠페인, 병원 마케팅 공동 지원 패키지 제공.', year: 2023 },
      { name: 'Ultraformer MPT Global', type: '글로벌 런칭', description: '80개국 딜러 네트워크 동시 론칭, 서울·런던·두바이 3개 도시 의사 체험 이벤트.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 Top 20 피부과 KOL', type: 'kol', description: '클래시스 어드바이저리 보드, 슈링크 임상 연구 및 소셜 콘텐츠 공동 제작.', platform: 'Instagram/YouTube' },
      { name: '싱가포르·UAE 선도 피부과 KOL', type: 'kol', description: '아시아·중동 핵심 시장 KOL 파트너십, 울트라포머 임상 데이터 공동 발표.', platform: '학회/YouTube' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@classys_kr',
      instagramHandle: '@classys_kr',
      instagramUrl: 'https://www.instagram.com/classys_kr/',
      websiteUrl: 'https://www.classys.com/',
    },
    benchmark: { portfolioBreadth: 82, premiumPower: 90, globalScale: 84, trainingStrength: 87, innovationSpeed: 88, socialPresence: 80 },
  },
  {
    id: 'merz',
    name: 'Merz Aesthetics',
    region: 'global',
    segment: 'injectables',
    indications: ['lifting', 'skincare'],
    country: 'Germany',
    positioning: 'Ultherapy·Xeomin·Belotero를 통해 HIFU + 보톡스 + 필러 전 영역을 포괄하는 글로벌 프리미엄 플랫폼. 2024년 울쎄라 PRIME 출시로 1세대 HIFU 대비 치료 속도 2배 향상 주장.',
    recentDevices: [
      { name: 'Ultherapy PRIME', year: 2024, category: 'HIFU', description: '2세대 울쎄라. 1.5MHz + 3MHz 통합 트랜스듀서, 기존 대비 치료 시간 50% 단축.', isNew: true },
      { name: 'Xeomin Plus', year: 2023, category: 'Neuromodulator', description: '인코보툴리눔톡신A 신형 포뮬러, 단백질 순도 강화.' },
      { name: 'Belotero Revive', year: 2023, category: 'Filler', description: '글리세롤 첨가 HA필러, 보습 & 리프팅 복합 효과.' },
    ],
    trends: [
      '1회 시술 결과물 강조 → "One-and-done" 마케팅 메시지 전환',
      'KOL 의사 유튜브 채널 후원 확대로 디지털 인지도 강화',
      '중동·동남아 신흥시장 직접 투자 확대',
    ],
    marketing: [
      { type: 'congress', name: 'AMWC Monaco 2025 메인 스폰서', description: '울쎄라 PRIME 유럽 첫 임상 데이터 공개 세션 단독 운영.' },
      { type: 'education', name: 'Merz Academy', description: '글로벌 의사 대상 온·오프라인 교육 플랫폼, 연 2만 명 이상 참여.' },
      { type: 'social', name: 'Before/After 비포애프터 캠페인', description: '임상의 인스타그램 계정 공동 콘텐츠 제작 프로그램.' },
    ],
    events: [
      { name: 'AMWC Monaco', year: 2025, role: 'sponsor' },
      { name: 'IMCAS World Congress', year: 2025, role: 'exhibitor' },
      { name: 'AAD Annual Meeting', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'Real Results', type: '소비자 캠페인', description: '실제 환자 비포/애프터 영상을 소셜에 공유하는 UGC 드라이브 캠페인.', year: 2024 },
      { name: 'Ultherapy PRIME Launch', type: '런칭 캠페인', description: '글로벌 KOL 80명 동시 런치 발표, CNN·Vogue 등 15개 매체 피처링.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Dr. Tasneem Bhimji', type: 'kol', description: '영국 선도 피부과 전문의, Ultherapy 클리닉 영상 시리즈 공동 제작.', platform: 'YouTube/Instagram' },
      { name: 'Ayesha Curry', type: 'celebrity', description: '미국 유명 셰프·방송인, Ultherapy PRIME 미국 론칭 앰배서더.', platform: 'Instagram' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@MerzAesthetics',
      youtubeVideoId: 'X1lg5tS9W9o',
      instagramHandle: '@merzaesthetics',
      instagramUrl: 'https://www.instagram.com/merzaesthetics/',
      websiteUrl: 'https://www.merz-aesthetics.com/',
    },
    benchmark: { portfolioBreadth: 88, premiumPower: 95, globalScale: 92, trainingStrength: 93, innovationSpeed: 85, socialPresence: 82 },
  },
  {
    id: 'solta',
    name: 'Solta Medical',
    region: 'global',
    segment: 'platform',
    indications: ['lifting', 'skincare', 'body'],
    country: 'United States',
    positioning: 'Thermage FLX·Fraxel·Clear+Brilliant로 세 시술 카테고리를 동시에 커버하는 에너지 디바이스 플랫폼. 2024년 Viatris(母社) 분사 이후 독립 성장 궤도.',
    recentDevices: [
      { name: 'Thermage FLX 5th Gen', year: 2024, category: 'Monopolar RF', description: 'AccuREP 기술로 치료 파라미터 실시간 최적화, 환자 컴포트 개선.', isNew: true },
      { name: 'Clear + Brilliant Touch', year: 2023, category: 'Fractional Laser', description: '저출력 분획 레이저, 다운타임 없는 스킨케어 포지셔닝.' },
    ],
    trends: [
      'Thermage "skin tightening" → "total face rejuvenation" 포지셔닝 확장',
      '인스타그램 Reels 활용 KOL 실시간 시술 영상 배포 확대',
      '아시아 신흥시장 딜러 네트워크 재편',
    ],
    marketing: [
      { type: 'influencer', name: 'Thermage Influencer Day', description: '의사·뷰티 인플루언서 합동 체험 이벤트, 유럽·아시아 순회.' },
      { type: 'pr', name: 'Vogue/Elle 피처링', description: '글로벌 패션 매거진 에디토리얼 협업, 프리미엄 클리닉 연계.' },
    ],
    events: [
      { name: 'IMCAS World Congress', year: 2025, role: 'exhibitor' },
      { name: 'AMWC Monaco', year: 2025, role: 'sponsor' },
      { name: 'ASLMS', year: 2025, role: 'speaker' },
    ],
    campaigns: [
      { name: 'Find Your Glow', type: '브랜드 캠페인', description: 'Thermage FLX 소비자 인지도 캠페인, 20개국 디지털 광고 집행.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Kim Kardashian (언급)', type: 'celebrity', description: '공식 협찬 계약 아니나 트위터/SNS 언급으로 미국 내 자발적 바이럴.', platform: 'Twitter/Instagram' },
      { name: 'Dr. Paul Nassif', type: 'kol', description: 'Botched 출연 성형외과 전문의, Solta 교육 프로그램 리더.', platform: 'Instagram/YouTube' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@SoltaMedical',
      instagramHandle: '@soltamedical',
      instagramUrl: 'https://www.instagram.com/soltamedical/',
      websiteUrl: 'https://www.soltamedical.com/',
    },
    benchmark: { portfolioBreadth: 90, premiumPower: 92, globalScale: 90, trainingStrength: 87, innovationSpeed: 80, socialPresence: 78 },
  },
  {
    id: 'inmode',
    name: 'InMode',
    region: 'global',
    segment: 'platform',
    indications: ['lifting', 'body', 'skincare'],
    country: 'Israel',
    positioning: 'Morpheus8·BodyTite·Forma로 소비자 주도 수요를 창출한 이스라엘계 RF 전문 기업. 시술명 자체를 브랜드화하는 전략으로 미국 클리닉·메디스파 시장 장악.',
    recentDevices: [
      { name: 'Morpheus8 Body', year: 2024, category: 'Fractional RF', description: '바디 전용 확장형, 피부·지방·근막 동시 타겟 Deep RF Subdermal Adipose Remodeling.', isNew: true },
      { name: 'EvolveX', year: 2023, category: 'Non-invasive Body', description: 'Tone+Transform+Tite 3 in 1 시스템, 완전 핸즈프리 시술.' },
      { name: 'Optimus', year: 2024, category: 'Laser Platform', description: '다파장 레이저 플랫폼, BodyTite 및 Morpheus 보완 라인업.' },
    ],
    trends: [
      '"Body by InMode" 해시태그 캠페인으로 바디 시술 수요 자발적 확산',
      '미국 메디스파 체인에 번들 패키지 판매 확대',
      '2024 나스닥 상장 이후 공격적 글로벌 유통 투자',
    ],
    marketing: [
      { type: 'social', name: '#MorpheusResult 캠페인', description: 'Instagram Reels 및 TikTok 시술 결과물 바이럴 캠페인, 게시물 5천만 회 뷰 돌파.', date: '2024' },
      { type: 'influencer', name: 'Reality TV 인플루언서 협업', description: 'The Real Housewives·Love Island 출연진 무상 시술 제공 후 소셜 노출.' },
    ],
    events: [
      { name: 'ASLMS', year: 2025, role: 'exhibitor' },
      { name: 'IMCAS', year: 2025, role: 'exhibitor' },
      { name: 'AAD Annual', year: 2025, role: 'sponsor' },
    ],
    campaigns: [
      { name: 'Body by InMode', type: '소셜 캠페인', description: '#BodyByInMode 해시태그 글로벌 캠페인, 클리닉-환자-인플루언서 3자 협업 구조.', year: 2024 },
      { name: 'Morpheus8 Launch Global', type: '글로벌 론칭', description: '60개국 동시 온라인 론칭, KOL 라이브 스트리밍 이벤트.', year: 2023 },
    ],
    ambassadors: [
      { name: 'Kim Zolciak-Biermann', type: 'celebrity', description: '미국 Reality TV 스타, Morpheus8 시술 경험 공개 포스팅 수백만 뷰.', platform: 'Instagram' },
      { name: 'Kourtney Kardashian', type: 'celebrity', description: '공개 언급 및 추정 체험, 미국 소비자 인지도 폭발적 증가.', platform: 'Instagram' },
      { name: 'Dr. Jason Diamond', type: 'kol', description: '할리우드 성형외과 전문의, InMode 글로벌 교육 이사.', platform: 'Instagram/YouTube' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@InModeMD',
      youtubeVideoId: 'iz6myiMzRsM',
      instagramHandle: '@inmodeaesthetics',
      instagramUrl: 'https://www.instagram.com/inmodeaesthetics/',
      websiteUrl: 'https://inmodemd.com/',
    },
    benchmark: { portfolioBreadth: 85, premiumPower: 84, globalScale: 86, trainingStrength: 79, innovationSpeed: 90, socialPresence: 95 },
  },
  {
    id: 'cynosure',
    name: 'Cynosure',
    region: 'global',
    segment: 'platform',
    indications: ['pigmentation', 'hair-removal', 'skincare', 'body'],
    country: 'United States',
    positioning: 'PicoSure·Elite iQ·Potenza를 보유한 멀티 카테고리 레이저·RF 기업. 2023년 Potenza RF 마이크로니들 글로벌 확대로 HIFU 경쟁군 진입.',
    recentDevices: [
      { name: 'PicoSure Pro', year: 2023, category: 'Picosecond Laser', description: '755nm 피코초 레이저, 색소 및 문신 제거 1위 포지션 강화.', isNew: false },
      { name: 'Potenza', year: 2022, category: 'RF Microneedling', description: '독점 Tiger Tip 니들, 모노/바이폴라 선택 가능한 RF 마이크로니들링.', isNew: false },
      { name: 'Elite iQ 2024', year: 2024, category: 'Dual Wavelength Laser', description: '755nm+1064nm 듀얼, 다피부타입 제모·혈관 적응증.', isNew: true },
    ],
    trends: [
      '피코 레이저 세그먼트에서 "속도"보다 "정밀도" 메시지 전환',
      '멀티플랫폼 번들 판매로 클리닉당 매출 단가 상승 전략',
    ],
    marketing: [
      { type: 'education', name: 'Syneron Cynosure Academy', description: '의사 대상 테크니컬 트레이닝 프로그램, 미국·유럽·아시아 3개 허브.' },
      { type: 'congress', name: 'AAD/ASLMS 주요 스폰서', description: '매년 미국 대형 학회 메인 전시관 독점 부스.' },
    ],
    events: [
      { name: 'AAD Annual', year: 2025, role: 'sponsor' },
      { name: 'ASLMS', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'PicoSure Pro Results', type: '임상 캠페인', description: '피코초 색소 치료 5년 추적 임상 결과 공개, 학술지 3편 동시 게재.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Dr. Mona Gohara', type: 'kol', description: '예일대 피부과 전문의·미디어 출연, Cynosure 채널 전속 의학 자문.', platform: 'Instagram/YouTube' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@CynosureLutronic',
      instagramHandle: '@cynosurelasers',
      instagramUrl: 'https://www.instagram.com/cynosurelasers/',
      websiteUrl: 'https://cynosurelutronic.com/',
    },
    benchmark: { portfolioBreadth: 89, premiumPower: 83, globalScale: 88, trainingStrength: 82, innovationSpeed: 78, socialPresence: 75 },
  },
  {
    id: 'lutronic',
    name: 'Lutronic',
    region: 'korea',
    segment: 'laser',
    indications: ['skincare', 'lifting', 'pigmentation'],
    country: 'South Korea',
    positioning: '레이저에서 RF까지 폭넓은 에너지 기반 장비 포트폴리오. 2023년 Cynosure와 합병 후 미국 직접 유통 채널 확보.',
    recentDevices: [
      { name: 'ULTRA', year: 2023, category: 'HIFU', description: '실시간 모니터링 탑재 HIFU, 아시아 클리닉 타겟.', isNew: false },
      { name: 'Genius RF 2.0', year: 2024, category: 'RF Microneedling', description: '실시간 임피던스 피드백 강화, 안전성 마케팅 포인트.', isNew: true },
      { name: 'Clarity II', year: 2022, category: 'Dual Laser', description: '755+1064nm 듀얼, 제모·색소·혈관 통합 플랫폼.' },
    ],
    trends: [
      '북미 시장 직판 전환 후 교육 프로그램 투자 2배 증가',
      'RF 마이크로니들 세그먼트에서 Morpheus8 대항마 포지셔닝',
    ],
    marketing: [
      { type: 'education', name: 'Lutronic Institute', description: '의사 대상 기술 교육 프로그램, 미국 보스턴·서울 양 거점.' },
      { type: 'congress', name: 'ASLMS 핵심 발표', description: 'Genius RF 임상 데이터 오럴 발표, 동료 심사 논문 5편 제출.' },
    ],
    events: [
      { name: 'ASLMS', year: 2025, role: 'speaker' },
      { name: 'IMCAS', year: 2025, role: 'exhibitor' },
      { name: 'KDA Spring', year: 2025, role: 'sponsor' },
    ],
    campaigns: [
      { name: 'Real Genius', type: '임상 캠페인', description: 'RF 마이크로니들 실환자 결과물 캠페인.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Dr. Brian Biesman', type: 'kol', description: '안성형 전문의, Lutronic 북미 어드바이저 보드 의장.', platform: 'Instagram' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@lutronickorea7871',
      youtubeVideoId: 'yPhV3DcjbXs',
      instagramHandle: '@lutronic.korea',
      instagramUrl: 'https://www.instagram.com/lutronic.korea/',
      websiteUrl: 'https://www.lutronic.com/',
    },
    benchmark: { portfolioBreadth: 86, premiumPower: 79, globalScale: 82, trainingStrength: 84, innovationSpeed: 80, socialPresence: 68 },
  },
  {
    id: 'jeisys',
    name: 'Jeisys Medical',
    region: 'korea',
    segment: 'hifu-rf',
    indications: ['lifting', 'skincare'],
    country: 'South Korea',
    positioning: 'DENSITY·LinearZ·POTENZA를 앞세운 리프팅 집중 플레이어. 클래시스와 동일 카테고리 직접 경쟁사.',
    recentDevices: [
      { name: 'DENSITY HIFU 3.0', year: 2024, category: 'HIFU', description: '3세대 덴서티, 조사 밀도 기존 대비 40% 향상 주장, 통증 감소 소구.', isNew: true },
      { name: 'LinearZ', year: 2023, category: 'HIFU Linear', description: '선형 HIFU, 리니어 조사로 안면 라인업 타이트닝 특화.' },
      { name: 'POTENZA Macro+Micro', year: 2024, category: 'RF Microneedling', description: '매크로/마이크로 니들 선택 모드, 2-in-1 RF 마이크로니들링.', isNew: true },
    ],
    trends: [
      '클래시스 슈링크 유니버스와 직접 비교 마케팅 강화',
      '아시아 신흥시장(베트남·인도네시아) 딜러 확장 집중',
      '통증 감소·편의성을 핵심 소구점으로 포지셔닝',
    ],
    marketing: [
      { type: 'congress', name: 'KDA/AESOPH 주요 참여', description: '국내 피부과·성형외과 학회 메인 스폰서·부스 운영.' },
      { type: 'education', name: 'Jeisys Academy', description: '국내외 의사 대상 핸즈온 트레이닝, 연 3,000명 이상 교육.' },
    ],
    events: [
      { name: 'KDA Spring Meeting', year: 2025, role: 'sponsor' },
      { name: 'AESOPH', year: 2025, role: 'exhibitor' },
      { name: 'IMCAS Asia', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'DENSITY vs 경쟁사 비교', type: '비교 광고', description: '경쟁 HIFU 대비 조사 밀도·통증·결과물 직접 비교 임상 자료 배포.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 선도 피부과 KOL 그룹', type: 'kol', description: '주요 피부과 전문의 10여 명 어드바이저리 보드 운영.', platform: '학회/SNS' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@제이시스메디칼',
      instagramHandle: '@jeisysmedical',
      instagramUrl: 'https://www.instagram.com/jeisysmedical/',
      websiteUrl: 'https://www.jeisys.com/eng/',
    },
    benchmark: { portfolioBreadth: 78, premiumPower: 76, globalScale: 74, trainingStrength: 77, innovationSpeed: 82, socialPresence: 65 },
  },
  {
    id: 'wontech',
    name: 'WONTECH',
    region: 'korea',
    segment: 'laser',
    indications: ['pigmentation', 'skincare', 'hair-removal'],
    country: 'South Korea',
    positioning: '피코·레이저·RF 복합 포트폴리오. 피코케어 시리즈로 피코초 색소 세그먼트 강자. 중동·동남아 유통 강점.',
    recentDevices: [
      { name: 'PICOCARE 900', year: 2024, category: 'Picosecond Laser', description: '900ps 펄스폭, 532+1064+785nm 3파장 통합, MLA 렌즈 최적화.', isNew: true },
      { name: 'TONURI', year: 2023, category: 'Nd:YAG Laser', description: '다파장 토닝 전용 Nd:YAG, 기미·색소 타겟 집중.' },
    ],
    trends: [
      '피코초 색소 세그먼트에서 중동 의사 대상 마케팅 집중',
      'OEM 공급 확대로 글로벌 브랜드 OEM 사업 성장',
    ],
    marketing: [
      { type: 'congress', name: '중동·동남아 지역 학회 참여', description: 'ESCRS·아랍에미리트 피부과 학회 주요 스폰서.' },
    ],
    events: [
      { name: 'IMCAS Asia', year: 2025, role: 'exhibitor' },
      { name: 'Beautyworld Middle East', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'PICOCARE Pro Results', type: '임상', description: '피코케어 900 중동 임상 결과 캠페인.', year: 2024 },
    ],
    ambassadors: [
      { name: '중동 KOL 네트워크', type: 'kol', description: '아랍에미리트·사우디 피부과 전문의 어드바이저리 그룹.', platform: '학회' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@wontech',
      youtubeVideoId: 'Qs_qQ7CTvWQ',
      instagramHandle: '@wontech_laser',
      instagramUrl: 'https://www.instagram.com/wontech_laser/',
      websiteUrl: 'https://wontech.co.kr/en/',
    },
    benchmark: { portfolioBreadth: 74, premiumPower: 69, globalScale: 70, trainingStrength: 68, innovationSpeed: 75, socialPresence: 58 },
  },
  {
    id: 'candela',
    name: 'Candela Medical',
    region: 'global',
    segment: 'laser',
    indications: ['hair-removal', 'pigmentation', 'lifting', 'skincare'],
    country: 'United States',
    positioning: 'GentleMax Pro Plus·Nordlys·vBeam 등 레이저 라인업의 전통 강자. 제모 레이저 세그먼트 글로벌 1위.',
    recentDevices: [
      { name: 'GentleMax Pro Plus', year: 2023, category: 'Dual Laser', description: '755+1064nm, Candela DCD(Dynamic Cooling Device) 통합. 글로벌 제모 레이저 점유율 1위.' },
      { name: 'Profound Matrix', year: 2024, category: 'RF Microneedling', description: '실시간 바이오마커 모니터링 탑재 RF 마이크로니들.', isNew: true },
    ],
    trends: [
      '제모 레이저 → 토탈 바디케어 플랫폼으로 브랜드 확장',
      '성형외과 채널 넘어 OB/GYN·비뇨기과 새로운 버티컬 진출',
    ],
    marketing: [
      { type: 'education', name: 'Candela Academy', description: '세계 최대 규모 레이저 의학 교육 프로그램, 연 2만5천 명 수료.' },
      { type: 'congress', name: 'AAD/ASLMS 핵심 발표', description: '제모·혈관·색소 분야 임상 오럴 발표 연평균 30건.' },
    ],
    events: [
      { name: 'AAD Annual', year: 2025, role: 'sponsor' },
      { name: 'ASLMS', year: 2025, role: 'speaker' },
    ],
    campaigns: [
      { name: 'Total Body Beauty', type: '브랜드', description: '바디 케어 확장 브랜드 캠페인.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Dr. Eric Bernstein', type: 'kol', description: '레이저 피부과 선도 연구자, Candela 글로벌 교육 어드바이저.', platform: '학회' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@CandelaMedical',
      youtubeVideoId: 'f1uenA8CUMw',
      instagramHandle: '@candelamedical',
      instagramUrl: 'https://www.instagram.com/candelamedical/',
      websiteUrl: 'https://candelamedical.com/',
    },
    benchmark: { portfolioBreadth: 87, premiumPower: 88, globalScale: 90, trainingStrength: 85, innovationSpeed: 76, socialPresence: 72 },
  },
  // ── 국내 추가 경쟁사 ────────────────────────────────────────────
  {
    id: 'asterasys',
    name: '아스테라시스',
    region: 'korea',
    segment: 'hifu-rf',
    indications: ['lifting', 'skincare'],
    country: 'South Korea',
    positioning: 'DOUBLO GOLD 시리즈로 HIFU 중저가 세그먼트를 장악한 국내 전통 강자. 가격 경쟁력과 광범위한 병원 네트워크를 바탕으로 아시아 신흥시장 점유율 확대 중.',
    recentDevices: [
      { name: 'DOUBLO GOLD II', year: 2024, category: 'HIFU', description: '더블로 골드 2세대. 조사 속도 개선 및 듀얼 카트리지 동시 운용 지원.', isNew: true },
      { name: 'DOUBLO SMART', year: 2023, category: 'HIFU', description: '소형화된 클리닉 전용 HIFU, 진입 장벽을 낮춰 중소 피부과 공략.' },
    ],
    trends: [
      '중저가 HIFU 세그먼트 1위 수성 — 가격 대비 효과 포지셔닝 강화',
      '동남아(베트남·인도네시아·태국) 딜러 네트워크 확대 집중',
      '클래시스 슈링크와의 직접 비교 임상 자료 배포 전략',
    ],
    marketing: [
      { type: 'education', name: 'Asterasys Hands-on Training', description: '전국 병원 방문 트레이닝 서비스, 빠른 교육 지원을 경쟁 우위로 활용.' },
      { type: 'congress', name: 'KDA / AESOPH 참여', description: '국내 학회 부스 전시 및 더블로 임상 포스터 발표.' },
    ],
    events: [
      { name: 'KDA Spring Meeting', year: 2025, role: 'exhibitor' },
      { name: 'AESOPH', year: 2025, role: 'exhibitor' },
      { name: 'IMCAS Asia', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'DOUBLO GOLD II 국내 론칭', type: '국내 런칭', description: '기존 DOUBLO 고객 업그레이드 프로모션 중심, 300개 클리닉 동시 전환 캠페인.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 피부과 KOL 그룹', type: 'kol', description: '더블로 임상 연구 어드바이저리, 학회 발표 및 소셜 콘텐츠 협업.', platform: '학회/Instagram' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@ASTERASYS',
      instagramHandle: '@asterasys_medical',
      instagramUrl: 'https://www.instagram.com/asterasys_medical/',
      websiteUrl: 'https://www.asterasys.com/',
    },
    benchmark: { portfolioBreadth: 66, premiumPower: 70, globalScale: 65, trainingStrength: 72, innovationSpeed: 74, socialPresence: 60 },
  },
  {
    id: 'tentech',
    name: '텐텍',
    region: 'korea',
    segment: 'hifu-rf',
    indications: ['lifting', 'skincare'],
    country: 'South Korea',
    positioning: 'Ultracel Q+ 시리즈로 국내 HIFU 3위권을 유지하는 전문 기업. 단일 카트리지 고효율 HIFU 기술력을 앞세워 국내·동남아 중급 클리닉 시장 공략.',
    recentDevices: [
      { name: 'Ultracel Q+', year: 2023, category: 'HIFU', description: '고집적 초음파, 단일 카트리지 복합 깊이 조사 지원. 소비전력 대비 출력 효율 강조.' },
      { name: 'Ultracel III Pro', year: 2024, category: 'HIFU', description: '프로 라인 업그레이드, 멀티 라인 조사 기능 추가.', isNew: true },
    ],
    trends: [
      '국내 중소 클리닉 가격 민감 시장 집중 공략',
      '동남아 신흥시장 OEM 공급 확대',
    ],
    marketing: [
      { type: 'education', name: '텐텍 트레이닝 프로그램', description: '전국 순회 의사 핸즈온 워크샵, 기기 도입 후 AS·교육 통합 패키지 제공.' },
    ],
    events: [
      { name: 'KDA Spring Meeting', year: 2025, role: 'exhibitor' },
      { name: 'IMCAS Asia', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'Ultracel Q+ 효능 캠페인', type: '임상 캠페인', description: '국내 피부과 임상 결과 비교 자료 배포, 가격 경쟁력 부각.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 중견 피부과 KOL', type: 'kol', description: '텐텍 임상 어드바이저리, 학회 포스터 공동 발표.', platform: '학회' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@TenTechOfficial',
      instagramHandle: '@tentech.kr',
      instagramUrl: 'https://www.instagram.com/tentech.kr/',
      websiteUrl: 'https://www.tentech.co.kr/',
    },
    benchmark: { portfolioBreadth: 58, premiumPower: 65, globalScale: 55, trainingStrength: 66, innovationSpeed: 70, socialPresence: 52 },
  },
  {
    id: 'viol',
    name: '비올',
    region: 'korea',
    segment: 'hifu-rf',
    indications: ['skincare', 'lifting'],
    country: 'South Korea',
    positioning: 'Scarlet S RF 마이크로니들링으로 국내 RF 마이크로니들 세그먼트를 개척한 선도 기업. 실시간 임피던스 기반 안전 시스템으로 의사 신뢰도 확보, 글로벌 OEM 공급 확대 중.',
    recentDevices: [
      { name: 'Scarlet 2', year: 2024, category: 'RF Microneedling', description: '스칼렛 2세대. 듀얼 모드(코팅/비코팅 니들) 지원, 조직 임피던스 실시간 모니터링 강화.', isNew: true },
      { name: 'Scarlet SRF', year: 2022, category: 'RF Microneedling', description: '독자 실시간 임피던스 피드백 시스템, 국내 RF 마이크로니들 1세대 기준점 제품.' },
    ],
    trends: [
      'RF 마이크로니들 시장 내 Morpheus8 대항마로 글로벌 포지셔닝',
      '미국·유럽 OEM 공급 계약 확대, 자사 브랜드 해외 론칭 준비 중',
      '모공·흉터 적응증 임상 강화로 피부과 전문 니치 포지셔닝',
    ],
    marketing: [
      { type: 'education', name: 'Scarlet 의사 교육 프로그램', description: '임피던스 기반 시술 프로토콜 교육, 국내 900개 이상 클리닉 도입 지원.' },
      { type: 'congress', name: 'AAD / ASLMS 발표', description: 'RF 마이크로니들 모공·흉터 치료 임상 오럴 발표, 글로벌 인지도 구축 중.' },
    ],
    events: [
      { name: 'KDA Spring Meeting', year: 2025, role: 'exhibitor' },
      { name: 'ASLMS', year: 2025, role: 'speaker' },
      { name: 'IMCAS World Congress', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'Scarlet 2 국내 론칭', type: '국내 런칭', description: '기존 Scarlet S 고객 업그레이드 프로모션, 500개 클리닉 전환 목표.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 모공·흉터 전문 피부과 KOL', type: 'kol', description: 'Scarlet 모공·흉터 치료 임상 연구 어드바이저리, 학회 논문 공동 발표.', platform: '학회/Instagram' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/channel/UCOsEOMu_RhXHHwsS34qFdvQ',
      instagramHandle: '@viol.official',
      instagramUrl: 'https://www.instagram.com/viol.official/',
      websiteUrl: 'https://www.viol.co.kr/',
    },
    benchmark: { portfolioBreadth: 60, premiumPower: 72, globalScale: 62, trainingStrength: 70, innovationSpeed: 78, socialPresence: 62 },
  },
  {
    id: 'pharmaresearch',
    name: '파마리서치',
    region: 'korea',
    segment: 'injectables',
    indications: ['skincare'],
    country: 'South Korea',
    positioning: 'REJURAN(리쥬란) 시리즈로 PDRN·PN 기반 바이오스티뮬레이터 글로벌 표준을 창시한 국내 이노베이터. 연어 DNA 유래 폴리뉴클레오타이드 원료 특허를 기반으로 전 세계 50개국 수출.',
    recentDevices: [
      { name: 'REJURAN HB Plus', year: 2024, category: 'PDRN Injectable', description: '고점도 HA 복합 포뮬러, 볼륨 + 재생 복합 효과 적응증 확장.', isNew: true },
      { name: 'REJURAN I', year: 2023, category: 'PDRN Eye Injectable', description: '눈가 전용 PDRN, 극세 니들 설계로 눈 주변 섬세 부위 적용.' },
      { name: 'REJURAN T', year: 2022, category: 'PDRN Tightening', description: '진피 타이트닝 특화 고농도 PDRN, 탄력 회복 임상 강조.' },
    ],
    trends: [
      'PDRN/PN 카테고리를 "스킨 부스터" → "바이오스티뮬레이터"로 재정의 선도',
      '유럽 CE 인증 및 미국 FDA 임상 진행, 선진시장 진출 가속화',
      '리쥬란 브랜드를 소비자 직접 인지 수준으로 끌어올리는 DTC 캠페인 강화',
    ],
    marketing: [
      { type: 'education', name: 'REJURAN Academy', description: 'PDRN 메커니즘·시술 프로토콜 전문의 교육, 국내외 50개국 의사 대상 온라인 플랫폼 운영.' },
      { type: 'pr', name: 'Vogue Korea / Harper\'s Bazaar 피처링', description: '리쥬란 "피부 의사" 메시지, 고급 패션 매거진 에디토리얼 연간 협업.' },
      { type: 'social', name: '리쥬란 Before/After 캠페인', description: '국내 피부과 인스타그램 KOL 협업, 피부 재생 비포애프터 UGC 드라이브.' },
    ],
    events: [
      { name: 'IMCAS World Congress', year: 2025, role: 'speaker' },
      { name: 'AMWC Monaco', year: 2025, role: 'exhibitor' },
      { name: 'KDA Spring Meeting', year: 2025, role: 'sponsor' },
    ],
    campaigns: [
      { name: 'REJURAN Global 50', type: '글로벌 캠페인', description: '수출 50개국 달성 기념 글로벌 의사 서밋, 서울·런던·싱가포르 동시 개최.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 피부과 재생 의학 KOL', type: 'kol', description: '리쥬란 임상 연구 어드바이저리, PDRN 메커니즘 논문 공동 저자.', platform: '학회/YouTube' },
    ],
    social: {
      instagramHandle: '@rejuran.global.official',
      instagramUrl: 'https://www.instagram.com/rejuran.global.official/',
      websiteUrl: 'https://www.pharmaresearch.co.kr/',
    },
    benchmark: { portfolioBreadth: 62, premiumPower: 84, globalScale: 76, trainingStrength: 74, innovationSpeed: 80, socialPresence: 72 },
  },
  {
    id: 'vaim',
    name: 'VAIM (바임)',
    region: 'korea',
    segment: 'hifu-rf',
    indications: ['lifting', 'skincare', 'body'],
    country: 'South Korea',
    positioning: '비침습 리프팅·바디 컨투어링 복합 플랫폼으로 국내 신흥 강자로 부상 중인 바임. 독자 HIFU + RF 융합 기술로 단일 기기 다적응증 소구, 중소 클리닉 올인원 니즈 공략.',
    recentDevices: [
      { name: 'VAIM PRO', year: 2024, category: 'HIFU + RF', description: 'HIFU와 RF 복합 플랫폼, 리프팅·피부 탄력·지방 감소 3가지 적응증 단일 기기 지원.', isNew: true },
      { name: 'VAIM BODY', year: 2023, category: 'Body Contouring', description: '고강도 집속 초음파 바디 지방 감소 전용 모드, 국내 바디 케어 클리닉 타겟.' },
    ],
    trends: [
      '중소 피부과·비만클리닉 올인원 기기 수요 공략',
      '가격 대비 성능 포지셔닝으로 프리미엄-중저가 간격 공략',
    ],
    marketing: [
      { type: 'education', name: 'VAIM 트레이닝 센터', description: '서울 본사 교육 센터 운영, 복합 모달리티 시술 프로토콜 전문의 교육.' },
    ],
    events: [
      { name: 'KDA Spring Meeting', year: 2025, role: 'exhibitor' },
      { name: 'AESOPH', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'VAIM PRO 론칭', type: '국내 런칭', description: '복합 플랫폼 올인원 소구 캠페인, 100개 클리닉 초기 도입 지원 패키지.', year: 2024 },
    ],
    ambassadors: [
      { name: '국내 비만·피부 전문 의사 그룹', type: 'doctor', description: 'VAIM 어드바이저리 보드, 바디 컨투어링 임상 프로토콜 공동 개발.', platform: '학회' },
    ],
    social: {
      instagramHandle: '@vaim_medical',
      instagramUrl: 'https://www.instagram.com/vaim_medical/',
      websiteUrl: 'https://www.vaim.co.kr/',
    },
    benchmark: { portfolioBreadth: 55, premiumPower: 64, globalScale: 48, trainingStrength: 60, innovationSpeed: 68, socialPresence: 52 },
  },
  // ── 해외 추가 경쟁사 ────────────────────────────────────────────
  {
    id: 'alma',
    name: 'Alma Lasers',
    region: 'global',
    segment: 'platform',
    indications: ['hair-removal', 'pigmentation', 'skincare', 'body'],
    country: 'Israel',
    positioning: 'Soprano ICE Platinum·Harmony XL Pro·Accent Prime로 제모·색소·바디 세 카테고리를 동시 제패하는 이스라엘계 멀티 플랫폼 강자. 전 세계 80개국 이상 유통망 보유.',
    recentDevices: [
      { name: 'Soprano Titanium', year: 2024, category: 'Diode Laser', description: '트리플 파장(755+810+1064nm) 동시 조사, 모든 피부 타입 제모 적응증 확장.', isNew: true },
      { name: 'Opus Plasma', year: 2023, category: 'Plasma RF', description: '픽셀형 플라즈마 기반 피부 재생, 비절삭 다운타임 최소화 포지셔닝.' },
      { name: 'Accent Prime', year: 2022, category: 'Ultrasound + RF', description: '초음파 + 유니폴라 RF 복합 바디 컨투어링 플랫폼.' },
    ],
    trends: [
      '제모 레이저에서 "스킨 웰니스 플랫폼"으로 브랜드 확장',
      '아시아·중동 직판 법인 강화로 딜러 의존도 축소',
      'Soprano Titanium 출시로 Candela GentleMax Pro와 정면 경쟁 구도',
    ],
    marketing: [
      { type: 'education', name: 'Alma University', description: '전세계 의사·테크니션 대상 온라인 교육 플랫폼, 연 1만5천 명 이수.' },
      { type: 'congress', name: 'EADV / AAD 주요 참여', description: '유럽·미국 피부과 학회 메인 전시 및 레이저 파장 비교 임상 발표.' },
    ],
    events: [
      { name: 'EADV Annual Congress', year: 2025, role: 'exhibitor' },
      { name: 'AAD Annual', year: 2025, role: 'sponsor' },
      { name: 'IMCAS World Congress', year: 2025, role: 'exhibitor' },
      { name: 'ASLMS', year: 2025, role: 'speaker' },
    ],
    campaigns: [
      { name: 'Beyond Hair Removal', type: '브랜드 캠페인', description: '제모 브랜드 이미지 탈피, 스킨 웰니스 멀티플랫폼 포지셔닝 글로벌 캠페인.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Dr. Omer Ibrahim', type: 'kol', description: '미국 Chicago 피부과 전문의, Alma 글로벌 교육 어드바이저, 소셜 영향력 30만 팔로워.', platform: 'Instagram/YouTube' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@almalasersinternational4132',
      instagramHandle: '@alma.lasers.international',
      instagramUrl: 'https://www.instagram.com/alma.lasers.international/',
      websiteUrl: 'https://www.almalasers.com/',
    },
    benchmark: { portfolioBreadth: 91, premiumPower: 83, globalScale: 89, trainingStrength: 82, innovationSpeed: 83, socialPresence: 74 },
  },
  {
    id: 'cutera',
    name: 'Cutera',
    region: 'global',
    segment: 'platform',
    indications: ['body', 'pigmentation', 'skincare', 'lifting'],
    country: 'United States',
    positioning: 'AviClear(여드름 레이저)·truSculpt iD(바디)·enlighten III(피코초)·Secret RF(마이크로니들)를 보유한 미국 나스닥 상장 멀티플랫폼. 여드름 레이저 세계 최초 FDA 승인으로 신규 카테고리 창출.',
    recentDevices: [
      { name: 'AviClear', year: 2022, category: 'Acne Laser', description: '세계 최초 여드름 치료 FDA 승인 레이저, 1064nm. 항생제 대안 포지셔닝으로 신규 카테고리 개척.', isNew: false },
      { name: 'truSculpt iD 2024', year: 2024, category: 'RF Body Contouring', description: '멀티핸드피스 동시 운용, 치료 시간 단축 업그레이드.', isNew: true },
      { name: 'enlighten SR', year: 2023, category: 'Picosecond Laser', description: '나노초+피코초 복합 모드, 색소·문신 제거 복합 적응증.' },
    ],
    trends: [
      'AviClear 여드름 레이저로 MedSpa 시장 신규 카테고리 선도',
      '2024 구조조정 이후 수익성 중심 전략으로 전환, 고마진 레이저 플랫폼 집중',
      '구독형 소모품 비즈니스 모델 도입으로 수익 안정화 시도',
    ],
    marketing: [
      { type: 'education', name: 'Cutera Institute', description: 'AviClear 소비자 인지도 강화를 위한 DTC 교육 캠페인, 의사·환자 동시 타겟.' },
      { type: 'congress', name: 'AAD / ASLMS 핵심 발표', description: 'AviClear 여드름 임상 2년 추적 데이터 공개, 학술 권위 확보 전략.' },
    ],
    events: [
      { name: 'AAD Annual', year: 2025, role: 'sponsor' },
      { name: 'ASLMS', year: 2025, role: 'speaker' },
      { name: 'IMCAS World Congress', year: 2025, role: 'exhibitor' },
    ],
    campaigns: [
      { name: 'Clear by AviClear', type: '소비자 캠페인', description: '여드름 치료 레이저 소비자 직접 인지 캠페인, 미국 주요 도시 OOH+디지털 집행.', year: 2024 },
    ],
    ambassadors: [
      { name: 'Dr. Murad Alam', type: 'kol', description: 'Northwestern 대학 피부과 학과장, AviClear 핵심 임상 연구자.', platform: '학회' },
    ],
    social: {
      youtubeChannelUrl: 'https://www.youtube.com/@CuteraInc',
      instagramHandle: '@cuterainc',
      instagramUrl: 'https://www.instagram.com/cuterainc/',
      websiteUrl: 'https://cutera.com/',
    },
    benchmark: { portfolioBreadth: 82, premiumPower: 78, globalScale: 76, trainingStrength: 74, innovationSpeed: 84, socialPresence: 70 },
  },
]

type Tab = 'overview' | 'marketing' | 'social' | 'events'

const BENCHMARK_LABELS: Record<keyof Competitor['benchmark'], string> = {
  portfolioBreadth: '포트폴리오',
  premiumPower: '프리미엄 파워',
  globalScale: '글로벌 스케일',
  trainingStrength: '교육 역량',
  innovationSpeed: '혁신 속도',
  socialPresence: '소셜 존재감',
}

const BENCHMARK_COLORS: Record<keyof Competitor['benchmark'], string> = {
  portfolioBreadth: '#002D74',
  premiumPower: '#7c3aed',
  globalScale: '#0891b2',
  trainingStrength: '#059669',
  innovationSpeed: '#f59e0b',
  socialPresence: '#ec4899',
}

export default function CompetitorsClient() {
  const [regionFilter, setRegionFilter] = useState<'all' | Region>('all')
  const [segmentFilter, setSegmentFilter] = useState<'all' | Segment>('all')
  const [indicationFilter, setIndicationFilter] = useState<'all' | Indication>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, Tab>>({})

  const filtered = COMPETITORS.filter(c => {
    if (regionFilter !== 'all' && c.region !== regionFilter) return false
    if (segmentFilter !== 'all' && c.segment !== segmentFilter) return false
    if (indicationFilter !== 'all' && !c.indications.includes(indicationFilter)) return false
    return true
  })

  function getTab(id: string): Tab { return activeTab[id] ?? 'overview' }
  function setTab(id: string, tab: Tab) { setActiveTab(prev => ({ ...prev, [id]: tab })) }

  return (
    <div className="min-h-full bg-[#f7f8fb]">
      <MarketNav />

      {/* 헤더 + 필터 */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Competitors</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">글로벌 경쟁사 인텔리전스</h1>
          <p className="mt-2 text-sm text-slate-500">
            클래시스 주요 경쟁사의 신규 장비·마케팅·SNS·캠페인·인플루언서 전략을 통합 분석합니다.
          </p>

          {/* 3단 필터 */}
          <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:gap-8">
            <FilterGroup
              label="지역"
              value={regionFilter}
              options={['all', 'korea', 'global']}
              labels={{ all: '전체', korea: '국내', global: '해외' }}
              onChange={v => setRegionFilter(v as 'all' | Region)}
            />
            <FilterGroup
              label="기기 세그먼트"
              value={segmentFilter}
              options={['all', 'hifu-rf', 'laser', 'injectables', 'platform']}
              labels={{ all: '전체', 'hifu-rf': 'HIFU / RF', laser: 'Laser', injectables: 'Injectables', platform: 'Multi-Platform' }}
              onChange={v => setSegmentFilter(v as 'all' | Segment)}
            />
            <FilterGroup
              label="주요 시술 적응증"
              value={indicationFilter}
              options={['all', 'lifting', 'skincare', 'body', 'pigmentation', 'hair-removal']}
              labels={{ all: '전체', lifting: '리프팅', skincare: '스킨케어', body: '바디', pigmentation: '색소', 'hair-removal': '제모' }}
              onChange={v => setIndicationFilter(v as 'all' | Indication)}
            />
          </div>

          {/* 집계 */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Pill label={`${filtered.length}개 업체`} icon={<Building2 className="h-3.5 w-3.5" />} color="blue" />
            <Pill label={`국내 ${filtered.filter(c => c.region === 'korea').length}`} icon={<ShieldCheck className="h-3.5 w-3.5" />} color="slate" />
            <Pill label={`해외 ${filtered.filter(c => c.region === 'global').length}`} icon={<Globe2 className="h-3.5 w-3.5" />} color="slate" />
            <Pill label={`신규 장비 보유 ${filtered.filter(c => c.recentDevices.some(d => d.isNew)).length}개사`} icon={<Sparkles className="h-3.5 w-3.5" />} color="amber" />
          </div>
        </div>
      </div>

      {/* 벤치마크 SVG 차트 */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Radar className="h-5 w-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-950">경쟁사 종합 벤치마크</h2>
            <span className="text-xs text-slate-400">(포트폴리오·프리미엄·글로벌·교육·혁신·소셜 6개 지표 합산)</span>
          </div>
          <BenchmarkChart companies={filtered} />
        </div>
      </div>

      {/* 경쟁사 카드 목록 */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            선택한 필터에 해당하는 경쟁사가 없습니다.
          </div>
        ) : (
          filtered.map(company => {
            const isOpen = expandedId === company.id
            const seg = SEGMENT_ACCENT[company.segment]
            const tab = getTab(company.id)
            const composite = Object.values(company.benchmark).reduce((a, b) => a + b, 0)
            return (
              <article key={company.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* 카드 헤더 */}
                <button
                  className="w-full px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : company.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">{company.name}</h3>
                        {company.isOwnCompany && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#002D74] px-2.5 py-1 text-[11px] font-bold text-white">
                            자사
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {company.country}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${seg.bg} ${seg.text}`}>
                          {SEGMENT_LABELS[company.segment]}
                        </span>
                        {company.recentDevices.some(d => d.isNew) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">
                            <Sparkles className="h-3 w-3" /> 신규 장비
                          </span>
                        )}
                        {company.ambassadors.some(a => a.type === 'celebrity') && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                            <Star className="h-3 w-3" /> 셀럽 앰배서더
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">{company.positioning}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {company.indications.map(ind => (
                          <span key={ind} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {INDICATION_LABELS[ind]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide">종합 점수</p>
                        <p className="text-2xl font-bold text-[#002D74]">{composite}</p>
                      </div>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>
                </button>

                {/* 확장 영역 */}
                {isOpen && (
                  <div className="border-t border-slate-100">
                    {/* 탭 */}
                    <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50">
                      {(['overview', 'marketing', 'social', 'events'] as Tab[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setTab(company.id, t)}
                          className={`shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                            tab === t
                              ? 'border-[#002D74] text-[#002D74] bg-white'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {t === 'overview' && '개요 & 장비'}
                          {t === 'marketing' && '마케팅 & 캠페인'}
                          {t === 'social' && 'SNS & 미디어'}
                          {t === 'events' && '학회 & 활동'}
                        </button>
                      ))}
                    </div>

                    <div className="p-6">
                      {/* 개요 & 장비 탭 */}
                      {tab === 'overview' && (
                        <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">장비 라인업</h4>
                              <div className="space-y-3">
                                {company.recentDevices.map(device => (
                                  <div key={device.name} className={`rounded-2xl p-4 ${device.isNew ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-slate-900 text-sm">{device.name}</span>
                                          {device.isNew && (
                                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">NEW {device.year}</span>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-slate-400">{device.category}</span>
                                        <p className="mt-1 text-sm text-slate-600">{device.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">주요 트렌드</h4>
                              <ul className="space-y-2">
                                {company.trends.map((trend, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <TrendingUp className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                    {trend}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {/* 벤치마크 바 차트 */}
                          <div className="rounded-2xl bg-slate-50 p-5">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">벤치마크 지표</h4>
                            <div className="space-y-3">
                              {(Object.entries(company.benchmark) as [keyof typeof company.benchmark, number][]).map(([key, val]) => (
                                <div key={key}>
                                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>{BENCHMARK_LABELS[key]}</span>
                                    <span className="font-semibold text-slate-700">{val}</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-slate-200">
                                    <div
                                      className="h-2 rounded-full transition-all duration-700"
                                      style={{ width: `${val}%`, backgroundColor: BENCHMARK_COLORS[key] }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 border-t border-slate-200 pt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">종합 점수</span>
                                <span className="text-xl font-bold text-[#002D74]">{composite} / 600</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 마케팅 & 캠페인 탭 */}
                      {tab === 'marketing' && (
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">마케팅 활동</h4>
                            <div className="space-y-3">
                              {company.marketing.map((m, i) => (
                                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MarketingTypeBadge type={m.type} />
                                    {m.date && <span className="text-[11px] text-slate-400">{m.date}</span>}
                                  </div>
                                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                                  <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">캠페인</h4>
                              <div className="space-y-3">
                                {company.campaigns.map((c, i) => (
                                  <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">{c.type}</span>
                                      {c.year && <span className="text-[11px] text-slate-400">{c.year}</span>}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                                    <p className="mt-1 text-sm text-slate-600">{c.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">앰배서더 / 인플루언서</h4>
                              <div className="space-y-2">
                                {company.ambassadors.map((a, i) => (
                                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200">
                                      {a.type === 'celebrity' ? <Star className="h-4 w-4 text-amber-500" /> : <Users className="h-4 w-4 text-blue-500" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-900">{a.name}</span>
                                        <AmbassadorBadge type={a.type} />
                                      </div>
                                      <p className="mt-0.5 text-sm text-slate-600">{a.description}</p>
                                      {a.platform && <p className="mt-0.5 text-[11px] text-slate-400">{a.platform}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SNS & 미디어 탭 */}
                      {tab === 'social' && (
                        <div className="space-y-6">
                          {/* YouTube + Instagram 2열 */}
                          <div className="grid gap-6 md:grid-cols-2">
                            {/* YouTube */}
                            {company.social.youtubeVideoId && company.social.youtubeVideoId !== 'TBD' ? (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <PlayCircle className="h-5 w-5 text-red-600" />
                                  <h4 className="text-sm font-semibold text-slate-800">YouTube</h4>
                                </div>
                                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${company.social.youtubeVideoId}?rel=0&modestbranding=1`}
                                    title={`${company.name} YouTube`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full"
                                  />
                                </div>
                                {company.social.youtubeChannelUrl && (
                                  <a
                                    href={company.social.youtubeChannelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                                  >
                                    YouTube 채널 바로가기 <ArrowUpRight className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            ) : company.social.youtubeChannelUrl ? (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <PlayCircle className="h-5 w-5 text-red-600" />
                                  <h4 className="text-sm font-semibold text-slate-800">YouTube 채널</h4>
                                </div>
                                <a
                                  href={company.social.youtubeChannelUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                                >
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                                    <PlayCircle className="h-6 w-6 text-red-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{company.name} YouTube</p>
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{company.social.youtubeChannelUrl}</p>
                                  </div>
                                  <ArrowUpRight className="h-4 w-4 text-slate-400 ml-auto" />
                                </a>
                              </div>
                            ) : null}

                            {/* 웹사이트 */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Monitor className="h-5 w-5 text-slate-600" />
                                <h4 className="text-sm font-semibold text-slate-800">공식 웹사이트</h4>
                              </div>
                              <a
                                href={company.social.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                  <Globe2 className="h-6 w-6 text-slate-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{company.name}</p>
                                  <p className="text-xs text-slate-500">{company.social.websiteUrl}</p>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-400 ml-auto" />
                              </a>
                            </div>
                          </div>

                          {/* Instagram 피드 그리드 (전체 너비) */}
                          {company.social.instagramUrl && company.social.instagramHandle && (
                            <InstagramFeedGrid
                              handle={company.social.instagramHandle}
                              url={company.social.instagramUrl}
                            />
                          )}
                        </div>
                      )}

                      {/* 학회 & 활동 탭 */}
                      {tab === 'events' && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {company.events.map((ev, i) => (
                            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{ev.name}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{ev.year}</p>
                                </div>
                                <EventRoleBadge role={ev.role} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

/* 서브 컴포넌트들 */

function FilterGroup({ label, value, options, labels, onChange }: {
  label: string
  value: string
  options: string[]
  labels: Record<string, string>
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              value === opt ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  )
}

function Pill({ label, icon, color }: { label: string; icon: React.ReactNode; color: 'blue' | 'slate' | 'amber' }) {
  const cls = color === 'blue' ? 'bg-blue-50 text-blue-700' : color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cls}`}>
      {icon}{label}
    </div>
  )
}

function MarketingTypeBadge({ type }: { type: MarketingType }) {
  const map: Record<MarketingType, { label: string; cls: string }> = {
    congress: { label: 'Congress', cls: 'bg-blue-50 text-blue-700' },
    campaign: { label: 'Campaign', cls: 'bg-violet-50 text-violet-700' },
    education: { label: 'Education', cls: 'bg-emerald-50 text-emerald-700' },
    influencer: { label: 'Influencer', cls: 'bg-pink-50 text-pink-700' },
    social: { label: 'Social', cls: 'bg-amber-50 text-amber-700' },
    pr: { label: 'PR / Media', cls: 'bg-slate-100 text-slate-600' },
  }
  const m = map[type]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.cls}`}>{m.label}</span>
}

function AmbassadorBadge({ type }: { type: AmbassadorType }) {
  const map: Record<AmbassadorType, { label: string; cls: string }> = {
    celebrity: { label: '셀럽', cls: 'bg-amber-50 text-amber-700' },
    influencer: { label: '인플루언서', cls: 'bg-pink-50 text-pink-700' },
    kol: { label: 'KOL', cls: 'bg-blue-50 text-blue-700' },
    doctor: { label: '전문의', cls: 'bg-emerald-50 text-emerald-700' },
  }
  const m = map[type]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}>{m.label}</span>
}

function EventRoleBadge({ role }: { role: 'exhibitor' | 'sponsor' | 'speaker' }) {
  const map = {
    exhibitor: { label: '전시', cls: 'bg-blue-50 text-blue-700' },
    sponsor: { label: '스폰서', cls: 'bg-amber-50 text-amber-700' },
    speaker: { label: '발표', cls: 'bg-emerald-50 text-emerald-700' },
  }
  const m = map[role]
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.cls}`}>{m.label}</span>
}

function BenchmarkChart({ companies }: { companies: Competitor[] }) {
  if (companies.length === 0) return null
  const barH = 28
  const labelW = 130
  const chartW = 480
  const gapY = 8
  const totalH = companies.length * (barH + gapY)
  const metrics = Object.keys(companies[0].benchmark) as (keyof Competitor['benchmark'])[]
  const maxComposite = Math.max(...companies.map(c => Object.values(c.benchmark).reduce((a, b) => a + b, 0)))

  return (
    <div className="overflow-x-auto">
      <svg width={labelW + chartW + 60} height={totalH + 30} className="text-xs font-medium">
        {companies.map((company, i) => {
          const composite = Object.values(company.benchmark).reduce((a, b) => a + b, 0)
          const barWidth = (composite / maxComposite) * chartW
          const y = i * (barH + gapY)
          let xOffset = 0
          return (
            <g key={company.id}>
              <text x={labelW - 8} y={y + barH / 2 + 4} textAnchor="end" fill="#64748b" fontSize={11}>
                {company.name}
              </text>
              {metrics.map(metric => {
                const segW = (company.benchmark[metric] / composite) * barWidth
                const rx = xOffset === 0 ? 4 : 0
                const el = (
                  <rect
                    key={metric}
                    x={labelW + xOffset}
                    y={y}
                    width={segW}
                    height={barH}
                    rx={rx}
                    fill={BENCHMARK_COLORS[metric]}
                    opacity={0.85}
                  />
                )
                xOffset += segW
                return el
              })}
              <text x={labelW + barWidth + 6} y={y + barH / 2 + 4} fill="#002D74" fontSize={11} fontWeight="700">
                {composite}
              </text>
            </g>
          )
        })}
        {/* 범례 */}
        <g transform={`translate(${labelW}, ${totalH + 10})`}>
          {metrics.map((m, i) => (
            <g key={m} transform={`translate(${i * 80}, 0)`}>
              <rect width={10} height={10} rx={2} fill={BENCHMARK_COLORS[m]} />
              <text x={14} y={9} fontSize={9} fill="#94a3b8">{BENCHMARK_LABELS[m]}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

const IG_CELL_GRADIENTS = [
  ['#fce7f3', '#f9a8d4'], ['#ede9fe', '#c4b5fd'], ['#fce7f3', '#fbcfe8'],
  ['#fdf4ff', '#e879f9'], ['#fff1f2', '#fda4af'], ['#f5f3ff', '#a78bfa'],
  ['#fdf2f8', '#f0abfc'], ['#fff0f7', '#f9a8d4'], ['#f3e8ff', '#d8b4fe'],
]

function InstagramFeedGrid({ handle, url }: { handle: string; url: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-5 w-5 text-pink-600" />
        <h4 className="text-sm font-semibold text-slate-800">Instagram 피드</h4>
        <span className="text-[11px] text-slate-400">{handle}</span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* 프로필 헤더 */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border-b border-slate-100">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold select-none">
              {handle.replace('@', '')[0]?.toUpperCase() ?? 'I'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">{handle}</p>
            <p className="text-[11px] text-slate-500">공식 Instagram 계정</p>
          </div>
          <span className="shrink-0 rounded-full bg-pink-600 px-3 py-1 text-[11px] font-semibold text-white">
            팔로우
          </span>
        </div>

        {/* 3×3 피드 그리드 */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-px bg-slate-200">
            {IG_CELL_GRADIENTS.map(([from, to], i) => (
              <div
                key={i}
                className="aspect-square flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                {/* 중앙 셀에 아이콘 */}
                {i === 4 && (
                  <Heart className="h-8 w-8 text-white/60" />
                )}
              </div>
            ))}
          </div>
          {/* 호버 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-xl border border-pink-100 text-sm font-bold text-pink-600">
              <Heart className="h-4 w-4" />
              Instagram에서 최신 피드 보기
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 text-xs font-medium text-pink-600">
          <Heart className="h-3.5 w-3.5" />
          최신 9개 게시물 보기 · Instagram 앱에서 열기
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </a>
    </div>
  )
}
