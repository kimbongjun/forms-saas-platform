'use client'

import { useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  ExternalLink,
  Globe,
  Link,
  RefreshCw,
  Tag,
  X,
  Zap,
} from 'lucide-react'
import MarketNav from './MarketNav'
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'

type FilterKey = 'all' | 'tech' | 'ai' | 'regulatory'

type Article = {
  id: string
  category: Exclude<FilterKey, 'all'>
  title: string
  source: string
  sourceUrl: string
  date: string
  region: string
  summary: string
  fullDetail: string
  insight: string
  tags: string[]
  relatedLinks: Array<{ label: string; url: string }>
  relevance: 'high' | 'mid' | 'low'
  classsysActionPoint: string
}

const ARTICLES: Article[] = [
  {
    id: 'hifu-imaging',
    category: 'tech',
    title: 'Real-time imaging is becoming a premium story in next-generation HIFU positioning',
    source: 'Lasers in Surgery and Medicine',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/10969101',
    date: '2026-05-05',
    region: 'Global',
    summary: '실시간 이미징과 시술 가시성을 결합한 HIFU 메시지가 프리미엄 카테고리에서 빠르게 확산되고 있습니다.',
    fullDetail:
      '장비 성능 자체보다 시술 과정의 가시성과 안전감을 강조하는 메시지가 늘고 있습니다. 환자 상담 단계에서 이해하기 쉬운 시각 자료를 제공하고, 시술자 입장에서는 레이어 타기팅 정확성을 전면에 내세우는 흐름입니다.',
    insight: 'CLASSYS도 리프팅 성능 설명과 함께 시술 경험, 해석 가능성, 상담 자료 구조를 묶어 프리미엄 포지셔닝을 강화할 수 있습니다.',
    tags: ['HIFU', 'Imaging', 'Premium', 'Clinical workflow'],
    relatedLinks: [
      { label: 'Journal homepage', url: 'https://onlinelibrary.wiley.com/journal/10969101' },
      { label: 'PubMed search', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=HIFU+imaging+aesthetic' },
    ],
    relevance: 'high',
    classsysActionPoint: 'Ultraformer MPT 상담 자료에 실시간 이미징 가시성 강조 메시지 추가 검토',
  },
  {
    id: 'rf-combo',
    category: 'tech',
    title: 'RF platforms are increasingly sold as combination-treatment engines rather than single devices',
    source: 'InMode',
    sourceUrl: 'https://inmodemd.com/',
    date: '2026-05-04',
    region: 'USA',
    summary: 'RF는 단품 비교보다 바디, 페이스, 업셀링 프로토콜까지 포함한 플랫폼 메시지로 판매되는 경향이 강합니다.',
    fullDetail:
      '시장 커뮤니케이션은 에너지 출력보다 패키지 시술 경험, 카트리지 체계, 운영 수익 구조를 중심으로 바뀌고 있습니다. 병원은 제품 하나보다 반복 매출 구조와 확장 가능한 시술 메뉴를 같이 평가합니다.',
    insight: 'CLASSYS의 경쟁 해석도 제품 스펙표 비교에 머물지 말고, 소모품 구조와 시술 번들 설계까지 확장할 필요가 있습니다.',
    tags: ['RF', 'Platform', 'Commercial model', 'Upsell'],
    relatedLinks: [
      { label: 'InMode corporate site', url: 'https://inmodemd.com/' },
      { label: 'Solta Medical overview', url: 'https://www.soltamedical.com/' },
    ],
    relevance: 'high',
    classsysActionPoint: 'VOLNEWMER + Ultraformer MPT 번들 프로토콜 패키지 영업 자료 개발 필요',
  },
  {
    id: 'skin-analysis',
    category: 'ai',
    title: 'AI skin analysis is moving from novelty to workflow support',
    source: 'Canfield Scientific',
    sourceUrl: 'https://www.canfieldsci.com/news',
    date: '2026-05-05',
    region: 'USA',
    summary: 'AI 분석은 독립 제품보다 상담, 추적 관찰, before/after 해석을 보조하는 워크플로우 도구로 자리 잡는 중입니다.',
    fullDetail:
      '피부 상태 분류, 사진 정렬, 결과 비교 리포트 생성 등 반복적인 실무를 줄이는 보조 기능이 핵심 가치로 보입니다. 병원 입장에서는 장비 도입보다 상담 효율과 전환율 개선이 직접적인 구매 동기가 됩니다.',
    insight: 'AI는 시장에서 하드웨어의 보조 가치로 해석되는 비중이 크므로, 장비 판매와 연결되는 운영 툴 관점에서 봐야 합니다.',
    tags: ['AI', 'Skin analysis', 'Workflow', 'Consultation'],
    relatedLinks: [
      { label: 'Canfield news', url: 'https://www.canfieldsci.com/news' },
      { label: 'FDA digital health center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
    ],
    relevance: 'mid',
    classsysActionPoint: 'CLASSYS Academy 교육 과정에 AI 기반 상담 보조 도구 연동 가능성 검토',
  },
  {
    id: 'samd-subscription',
    category: 'ai',
    title: 'SaMD value is increasingly framed as subscription support around a device business',
    source: 'FDA Digital Health',
    sourceUrl: 'https://www.fda.gov/medical-devices/digital-health-center-excellence',
    date: '2026-05-02',
    region: 'USA',
    summary: '소프트웨어 기능은 단독 매출보다 하드웨어 유지, 결과 추적, 리포팅 구독과 연결될 때 상업성이 커집니다.',
    fullDetail:
      'SaMD는 단순 승인 여부보다 업데이트 관리, 데이터 보관, 병원 내 반복 사용성, 영업 스토리 결합이 핵심입니다. 실제 시장에서는 상담 도구와 임상 결과 추적 기능이 더 자주 언급됩니다.',
    insight: '시장조사 관점에서는 AI 기능이 독립 사업인지, 장비 판매 보조인지 구분해서 보는 것이 중요합니다.',
    tags: ['SaMD', 'Subscription', 'AI', 'Software layer'],
    relatedLinks: [
      { label: 'FDA SaMD overview', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd' },
      { label: 'Digital health center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
    ],
    relevance: 'mid',
    classsysActionPoint: '장비 판매 후 임상 추적·리포트 구독 모델 설계 가능성을 제품 기획팀과 협의',
  },
  {
    id: 'fda-ai-guidance',
    category: 'regulatory',
    title: 'AI/ML change control expectations are becoming a key product planning issue',
    source: 'FDA',
    sourceUrl: 'https://www.fda.gov/medical-devices/digital-health-center-excellence',
    date: '2026-05-01',
    region: 'USA',
    summary: 'AI 기능은 단순 추가보다 업데이트 계획, 설명 책임, 사후 관리 설계까지 같이 요구되는 방향입니다.',
    fullDetail:
      '제품 기획 단계에서 성능 개선 로직을 어떻게 관리할지, 어떤 범위의 자동 업데이트가 허용될지를 미리 설계해야 합니다. 규제는 모델 변경 관리와 검증 체계를 점점 더 구체적으로 요구합니다.',
    insight: 'AI 기능은 출시 이후의 운영 시나리오까지 포함해서 계획하지 않으면 시장 진입 속도가 늦어질 수 있습니다.',
    tags: ['FDA', 'AI/ML', 'Guidance', 'Regulatory'],
    relatedLinks: [
      { label: 'FDA guidance search', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents' },
      { label: 'Digital health center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
    ],
    relevance: 'mid',
    classsysActionPoint: '미국 시장 AI 기능 출시 시 변경 관리 계획(PCCP) 사전 수립 및 RA팀 검토 요청',
  },
  {
    id: 'eu-mdr-timeline',
    category: 'regulatory',
    title: 'EU MDR timing still affects launch sequencing for many mid-tier device companies',
    source: 'MedTech Europe',
    sourceUrl: 'https://www.medtecheurope.org/',
    date: '2026-04-30',
    region: 'Europe',
    summary: '유럽 인증 일정과 인증기관 병목은 여전히 제품 출시 순서와 파트너 대응 속도에 영향을 줍니다.',
    fullDetail:
      '유럽 진출은 제품력만이 아니라 문서 준비, 인증기관 일정, 현지 파트너 커뮤니케이션 리듬이 함께 맞아야 합니다. 경쟁사 출시 시점 해석에서도 이 요소를 빼면 실제 판단이 틀어질 수 있습니다.',
    insight: '시장조사 화면에서도 유럽 경쟁사 소식은 제품 발표일보다 실제 판매 개시 시점과 인증 문맥을 같이 봐야 합니다.',
    tags: ['EU MDR', 'Launch timing', 'Certification', 'Europe'],
    relatedLinks: [
      { label: 'MedTech Europe', url: 'https://www.medtecheurope.org/' },
      { label: 'EU medical devices sector', url: 'https://health.ec.europa.eu/medical-devices-sector_en' },
    ],
    relevance: 'high',
    classsysActionPoint: '유럽 신제품 출시 계획 시 인증기관 일정 12개월 선행 확보 및 NB 병목 리스크 검토',
  },
  // ── Technology 추가 8개 ──────────────────────────────────────────
  {
    id: 'ultrasound-elastography',
    category: 'tech',
    title: 'Ultrasound elastography in aesthetic devices enables real-time tissue stiffness mapping',
    source: 'Lasers Surg Med',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/10969101',
    date: '2026-05-06',
    region: 'Global',
    summary: '초음파 탄성계수 이미징이 에스테틱 장비에 통합돼 실시간 조직 강도 매핑이 가능해지고 있습니다.',
    fullDetail: '탄성계수 이미징은 시술 전후 조직 변화를 정량화해 임상 효과를 객관적으로 입증하는 도구로 주목받고 있습니다. HIFU 및 RF 시술의 타겟 레이어 정확도를 높이는 데 응용 가능성이 큽니다.',
    insight: '조직 경도 변화 데이터를 시각화해 임상 결과물의 신뢰도를 높이는 방향으로 CLASSYS 제품 포지셔닝에 활용 가능합니다.',
    tags: ['Ultrasound', 'Elastography', 'HIFU', 'Clinical evidence'],
    relatedLinks: [
      { label: 'Lasers Surg Med', url: 'https://onlinelibrary.wiley.com/journal/10969101' },
      { label: 'PubMed search', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=elastography+aesthetic' },
    ],
    relevance: 'high',
    classsysActionPoint: 'Ultraformer MPT 임상 데이터에 탄성계수 변화 지표 추가해 학회 발표 강화',
  },
  {
    id: 'picosecond-asian-skin',
    category: 'tech',
    title: 'Picosecond laser evolution optimized for Asian skin types shows superior pigmentation clearance',
    source: 'J Dermatol',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/13468138',
    date: '2026-05-03',
    region: 'Asia',
    summary: '아시아 피부 타입에 최적화된 피코초 레이저의 색소 치료 효과가 기존 Nd:YAG 대비 우수함을 보여주는 임상 근거가 축적되고 있습니다.',
    fullDetail: '아시아인 피부의 멜라닌 분포 특성에 맞춘 파장 조합과 펄스폭 설계가 핵심입니다. 국내 피코초 레이저 제조사들의 임상 발표가 증가하며 글로벌 학술 지위가 높아지고 있습니다.',
    insight: '클래시스가 피코 레이저 라인업 확장 시 아시아 임상 데이터를 선제적으로 확보하면 경쟁 우위 가능합니다.',
    tags: ['Picosecond', 'Asian skin', 'Pigmentation', 'Laser'],
    relatedLinks: [
      { label: 'J Dermatol', url: 'https://onlinelibrary.wiley.com/journal/13468138' },
      { label: 'PubMed pigmentation', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=picosecond+asian+skin' },
    ],
    relevance: 'mid',
    classsysActionPoint: '국내 피부과 KOL과 아시아 피부 타입 특화 HIFU 임상 연구 공동 설계 검토',
  },
  {
    id: 'body-contouring-outcomes',
    category: 'tech',
    title: 'Energy-based body contouring: 2026 clinical outcomes meta-analysis',
    source: 'Aesthet Surg J',
    sourceUrl: 'https://academic.oup.com/asj',
    date: '2026-04-28',
    region: 'USA',
    summary: '에너지 기반 바디 컨투어링의 2026년 임상 결과 메타분석이 발표되어 RF와 HIFU 바디 치료의 비교 근거가 강화됩니다.',
    fullDetail: '비침습 지방 감소 및 피부 탄력 개선 분야에서 에너지 기반 장비의 임상 근거가 누적되고 있습니다. RF 기반 장비가 통증 대비 효과 측면에서 높은 평가를 받는 추세입니다.',
    insight: 'VOLNEWMER 출시와 맞물려 바디 컨투어링 임상 근거를 선제적으로 학술 발표에 반영하면 유리합니다.',
    tags: ['Body contouring', 'RF', 'HIFU', 'Clinical outcomes'],
    relatedLinks: [
      { label: 'Aesthet Surg J', url: 'https://academic.oup.com/asj' },
      { label: 'PubMed body contouring', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=body+contouring+energy+based' },
    ],
    relevance: 'high',
    classsysActionPoint: 'VOLNEWMER 바디 컨투어링 임상 결과를 2026 ASLMS/IMCAS에 학술 발표 준비',
  },
  {
    id: 'rf-microneedling-synergy',
    category: 'tech',
    title: 'Combination RF microneedling and topical synergy data shows 40% enhanced collagen induction',
    source: 'Dermatol Surg',
    sourceUrl: 'https://journals.lww.com/dermatologicsurgery',
    date: '2026-04-25',
    region: 'USA',
    summary: 'RF 마이크로니들링과 국소 도포제의 병용 시술 시너지 데이터가 발표돼 복합 프로토콜의 임상 근거가 강화됩니다.',
    fullDetail: 'RF 마이크로니들링 직후 성장인자 또는 PDRN 병용 시 콜라겐 생성이 단독 시술 대비 최대 40% 증가하는 임상 결과가 제시됐습니다. 병원 수익성 측면에서도 복합 시술 프로토콜이 효과적입니다.',
    insight: 'VOLNEWMER와 리쥬란·스킨부스터 병용 프로토콜을 학술 근거와 함께 영업 도구화 가능합니다.',
    tags: ['RF Microneedling', 'Combination', 'Collagen', 'Protocol'],
    relatedLinks: [
      { label: 'Dermatol Surg', url: 'https://journals.lww.com/dermatologicsurgery' },
      { label: 'PubMed RF microneedling', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=RF+microneedling+combination' },
    ],
    relevance: 'high',
    classsysActionPoint: 'VOLNEWMER + 스킨부스터 병용 프로토콜 임상 설계 및 국내 KOL 공동 연구 추진',
  },
  {
    id: 'next-gen-cooling',
    category: 'tech',
    title: 'Next-generation cooling systems reduce procedure discomfort by 60% in energy-based devices',
    source: 'Skin Res Tech',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/16000846',
    date: '2026-04-20',
    region: 'Global',
    summary: '차세대 쿨링 시스템이 에너지 기반 장비의 시술 불편감을 최대 60% 감소시키는 것으로 보고됐습니다.',
    fullDetail: '쿨링 기술의 개선은 환자 경험 향상과 직결되며, 고출력 시술을 낮은 통증으로 제공할 수 있는 차별점이 됩니다. 특히 HIFU와 RF 마이크로니들 분야에서 쿨링 성능이 구매 결정 요인으로 부상 중입니다.',
    insight: '슈링크 및 울트라포머 신규 카트리지 개발 시 쿨링 성능 개선을 핵심 마케팅 포인트로 활용 가능합니다.',
    tags: ['Cooling', 'Patient comfort', 'HIFU', 'RF'],
    relatedLinks: [
      { label: 'Skin Res Tech', url: 'https://onlinelibrary.wiley.com/journal/16000846' },
    ],
    relevance: 'mid',
    classsysActionPoint: '차기 카트리지 개발 로드맵에 쿨링 성능 지표 포함 및 경쟁사 대비 비교 자료 준비',
  },
  {
    id: 'hifu-ai-transducer',
    category: 'tech',
    title: 'AI-guided transducer control enables adaptive HIFU depth targeting with 95% precision',
    source: 'Ultrasound Med Biol',
    sourceUrl: 'https://www.umbjournal.org/',
    date: '2026-05-01',
    region: 'Global',
    summary: 'AI 기반 트랜스듀서 제어로 HIFU 조사 깊이 정확도가 95%까지 향상되는 연구 결과가 발표됐습니다.',
    fullDetail: '환자 피부 두께와 조직 특성을 실시간으로 감지해 트랜스듀서 출력을 자동 조정하는 AI 알고리즘이 개발되고 있습니다. 이는 시술자 의존도를 낮추고 균일한 결과물을 보장하는 핵심 기술입니다.',
    insight: 'Ultraformer MPT 차기 버전에 AI 깊이 타기팅 기능 도입 시 경쟁사 대비 명확한 기술 차별화 가능합니다.',
    tags: ['HIFU', 'AI', 'Transducer', 'Precision'],
    relatedLinks: [
      { label: 'Ultrasound Med Biol', url: 'https://www.umbjournal.org/' },
      { label: 'PubMed HIFU AI', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=HIFU+AI+depth+targeting' },
    ],
    relevance: 'high',
    classsysActionPoint: 'R&D 로드맵에 AI 기반 적응형 HIFU 조사 제어 기술 중장기 과제로 반영 검토',
  },
  // ── AI/SaMD 추가 5개 ──────────────────────────────────────────
  {
    id: 'generative-ai-simulation',
    category: 'ai',
    title: 'Generative AI enables photorealistic pre/post treatment simulation for aesthetic consultations',
    source: 'Nature Digital Medicine',
    sourceUrl: 'https://www.nature.com/npjdigitalmed/',
    date: '2026-05-04',
    region: 'Global',
    summary: '생성형 AI가 에스테틱 시술 전/후 결과를 사실적으로 시뮬레이션해 환자 상담 전환율을 높이는 도구로 주목받고 있습니다.',
    fullDetail: '환자에게 예상 결과물을 시각적으로 제시하면 상담 설득력과 시술 동의율이 높아진다는 연구 결과가 다수 발표됐습니다. 생성형 AI 시뮬레이션은 병원 마케팅 차별화 도구로도 활용됩니다.',
    insight: 'CLASSYS 장비에 AI 시뮬레이션 상담 도구를 번들로 제공하면 병원 도입 결정을 가속화할 수 있습니다.',
    tags: ['Generative AI', 'Simulation', 'Consultation', 'Patient conversion'],
    relatedLinks: [
      { label: 'Nature Digital Medicine', url: 'https://www.nature.com/npjdigitalmed/' },
    ],
    relevance: 'high',
    classsysActionPoint: 'CLASSYS Academy 플랫폼에 AI 시뮬레이션 상담 모듈 도입 가능성 검토 및 파트너사 발굴',
  },
  {
    id: 'llm-consultation',
    category: 'ai',
    title: 'Large language models improve patient consultation script quality by 35% in clinical settings',
    source: 'JMIR',
    sourceUrl: 'https://www.jmir.org/',
    date: '2026-04-30',
    region: 'Global',
    summary: 'LLM 기반 상담 스크립트 자동 생성이 의사의 시술 설명 품질과 환자 만족도를 동시에 향상시키는 것으로 나타났습니다.',
    fullDetail: '복잡한 시술 메커니즘을 환자가 이해하기 쉬운 언어로 자동 변환하는 LLM 도구가 병원 현장에서 채택되고 있습니다. 다국어 지원 기능은 글로벌 클리닉에서 특히 유용합니다.',
    insight: '다국어 상담 스크립트를 지원하는 AI 도구를 글로벌 딜러 네트워크에 제공하면 CLASSYS 장비 판매 지원 강화 가능합니다.',
    tags: ['LLM', 'Consultation', 'AI', 'Patient education'],
    relatedLinks: [
      { label: 'JMIR', url: 'https://www.jmir.org/' },
    ],
    relevance: 'mid',
    classsysActionPoint: '글로벌 딜러용 다국어 AI 상담 스크립트 패키지 개발 및 CLASSYS Academy 통합 검토',
  },
  {
    id: 'ai-skin-aging',
    category: 'ai',
    title: 'AI-powered skin aging assessment achieves 92% correlation with expert dermatologist grading',
    source: 'Br J Dermatol',
    sourceUrl: 'https://academic.oup.com/bjd',
    date: '2026-04-22',
    region: 'Global',
    summary: 'AI 기반 피부 노화 평가 시스템이 전문의 판정과 92% 일치하는 검증 결과가 발표됐습니다.',
    fullDetail: '딥러닝 기반 피부 노화 스코어링 알고리즘이 임상 검증을 통과하면서 SaMD 등록 경로가 열리고 있습니다. 시술 전후 객관적 결과 측정 도구로서의 상업적 가치가 높아지고 있습니다.',
    insight: 'CLASSYS 장비 구매 클리닉에 피부 노화 AI 평가 도구를 번들 제공하면 임상 데이터 축적과 마케팅 강화 동시 달성 가능합니다.',
    tags: ['AI', 'Skin aging', 'Validation', 'SaMD'],
    relatedLinks: [
      { label: 'Br J Dermatol', url: 'https://academic.oup.com/bjd' },
      { label: 'PubMed AI skin', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=AI+skin+aging+assessment' },
    ],
    relevance: 'mid',
    classsysActionPoint: '피부 노화 AI 평가 모듈과 장비 번들 판매 전략 수립 및 국내 임상 파트너십 검토',
  },
  {
    id: 'predictive-maintenance',
    category: 'ai',
    title: 'Predictive analytics reduces device downtime by 45% through proactive maintenance scheduling',
    source: 'J Clin Eng',
    sourceUrl: 'https://journals.lww.com/jcengineering',
    date: '2026-04-15',
    region: 'Global',
    summary: 'AI 예측 분석 기반 사전 정비 일정 관리가 의료기기 다운타임을 45% 줄이는 성과를 보이고 있습니다.',
    fullDetail: '센서 데이터와 사용 패턴 분석을 통해 장비 고장을 사전 예측하는 AI 모델이 병원 운영 효율성을 크게 향상시키고 있습니다. 클리닉 입장에서 장비 가동률 보장은 구매 결정의 중요 요소입니다.',
    insight: 'CLASSYS 장비에 IoT 기반 예측 정비 서비스를 추가하면 AS 차별화 및 고객 락인(lock-in) 강화 가능합니다.',
    tags: ['Predictive analytics', 'Maintenance', 'IoT', 'Device management'],
    relatedLinks: [
      { label: 'J Clin Eng', url: 'https://journals.lww.com/jcengineering' },
    ],
    relevance: 'low',
    classsysActionPoint: '클래시스 장비 IoT 원격 모니터링 및 예측 정비 서비스 도입 타당성 검토',
  },
  // ── Regulatory 추가 5개 ──────────────────────────────────────────
  {
    id: 'fda-510k-trends',
    category: 'regulatory',
    title: 'FDA 510(k) clearance trends for aesthetic devices: 2025-2026 analysis',
    source: 'FDA Guidance',
    sourceUrl: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k',
    date: '2026-04-18',
    region: 'USA',
    summary: '2025~2026년 에스테틱 장비 FDA 510(k) 허가 트렌드 분석에서 AI 통합 장비와 RF 복합 플랫폼의 허가 속도가 빨라지고 있습니다.',
    fullDetail: '에스테틱 장비의 FDA 510(k) 허가 건수가 2024년 대비 18% 증가했으며 AI 기능이 포함된 장비의 허가 비중이 늘어나고 있습니다. 경쟁사의 신규 허가 현황을 주기적으로 모니터링하는 것이 중요합니다.',
    insight: '미국 시장 진출을 위한 Ultraformer MPT 및 VOLNEWMER의 510(k) 전략을 경쟁사 허가 트렌드에 맞춰 재검토 필요합니다.',
    tags: ['FDA', '510(k)', 'Clearance', 'USA market'],
    relatedLinks: [
      { label: 'FDA 510(k) database', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm' },
      { label: 'FDA aesthetic devices', url: 'https://www.fda.gov/medical-devices' },
    ],
    relevance: 'high',
    classsysActionPoint: '미국 법인 통해 경쟁사 510(k) 허가 현황 분기별 모니터링 체계 구축 및 자사 허가 전략 업데이트',
  },
  {
    id: 'eu-mdr-ai-devices',
    category: 'regulatory',
    title: 'EU MDR compliance pathway for AI-integrated aesthetic devices requires new clinical evidence standards',
    source: 'Medical Device Regulation',
    sourceUrl: 'https://health.ec.europa.eu/medical-devices-sector_en',
    date: '2026-04-10',
    region: 'Europe',
    summary: 'AI 통합 에스테틱 장비의 EU MDR 인증이 새로운 임상 근거 기준을 요구하며 절차가 복잡해지고 있습니다.',
    fullDetail: 'AI 기능이 포함된 의료기기는 EU MDR에서 별도 임상 근거 수집 요건이 적용됩니다. Notified Body의 심사 기간이 길어지고 있어 출시 일정 계획 시 충분한 여유 시간이 필요합니다.',
    insight: '유럽 신제품 출시 시 AI 기능 포함 여부에 따라 인증 전략을 이원화하고 NB 선정을 조기에 진행해야 합니다.',
    tags: ['EU MDR', 'AI devices', 'Clinical evidence', 'Notified Body'],
    relatedLinks: [
      { label: 'EU MDR', url: 'https://health.ec.europa.eu/medical-devices-sector_en' },
      { label: 'MedTech Europe', url: 'https://www.medtecheurope.org/' },
    ],
    relevance: 'high',
    classsysActionPoint: '유럽 출시 예정 신제품의 AI 기능 범위 확정 후 NB 사전 협의 및 임상 근거 계획 수립',
  },
  {
    id: 'china-nmpa-pathway',
    category: 'regulatory',
    title: 'China NMPA expedited pathway for innovative aesthetic devices cuts approval time by 30%',
    source: 'Regulatory Focus',
    sourceUrl: 'https://www.raps.org/regulatory-focus',
    date: '2026-03-28',
    region: 'China',
    summary: '중국 NMPA가 혁신 에스테틱 장비에 대한 신속 심사 경로를 도입해 허가 기간이 평균 30% 단축됐습니다.',
    fullDetail: '혁신 의료기기 지정 신청을 통해 우선 심사 트랙을 활용할 수 있으며, HIFU 및 RF 복합 플랫폼이 주요 대상입니다. 중국 시장 진입 가속화를 위한 전략적 기회가 열리고 있습니다.',
    insight: '클래시스 중국 법인을 통한 NMPA 혁신 기기 지정 신청으로 울트라포머 MPT 허가 기간을 단축할 수 있습니다.',
    tags: ['NMPA', 'China', 'Expedited pathway', 'Innovative device'],
    relatedLinks: [
      { label: 'Regulatory Focus', url: 'https://www.raps.org/regulatory-focus' },
      { label: 'NMPA', url: 'https://english.nmpa.gov.cn/' },
    ],
    relevance: 'high',
    classsysActionPoint: '중국 NMPA 혁신 의료기기 지정 신청 가능성 검토 및 현지 RA 에이전트와 전략 수립',
  },
  {
    id: 'korea-mfds-digital',
    category: 'regulatory',
    title: 'Korea MFDS digital health guidance update expands AI device approval scope for aesthetics',
    source: 'MFDS Notice',
    sourceUrl: 'https://www.mfds.go.kr/eng/index.do',
    date: '2026-04-05',
    region: 'Korea',
    summary: '식품의약품안전처가 디지털 헬스 가이던스를 업데이트해 에스테틱 AI 장비의 허가 범위가 확대됐습니다.',
    fullDetail: '국내 MFDS가 AI 기반 에스테틱 장비에 대한 허가 기준을 명확히 제시하면서 국내 AI 통합 에스테틱 기기의 허가 절차가 예측 가능해졌습니다. 소프트웨어 의료기기(SaMD) 분리 허가 경로도 명시됐습니다.',
    insight: '국내 AI 기능 내장 CLASSYS 장비의 허가 전략을 MFDS 신규 가이던스에 맞춰 업데이트하고 규제 선제 대응 필요합니다.',
    tags: ['MFDS', 'Korea', 'Digital health', 'AI device'],
    relatedLinks: [
      { label: 'MFDS', url: 'https://www.mfds.go.kr/eng/index.do' },
      { label: 'MFDS digital health', url: 'https://www.mfds.go.kr/eng/index.do' },
    ],
    relevance: 'high',
    classsysActionPoint: 'MFDS 디지털 헬스 가이던스 검토 후 국내 AI 통합 장비 허가 로드맵 업데이트',
  },
  {
    id: 'brazil-anvisa',
    category: 'regulatory',
    title: 'ANVISA aesthetic device approval changes streamline Brazil market entry for Class II devices',
    source: 'RegAffairs Pro',
    sourceUrl: 'https://www.regulatoryaffairsprofessionals.org/',
    date: '2026-03-20',
    region: 'Brazil',
    summary: '브라질 ANVISA의 에스테틱 장비 허가 절차 변경으로 Class II 장비의 시장 진입 절차가 간소화됐습니다.',
    fullDetail: '브라질 에스테틱 장비 시장은 연평균 12% 성장하는 중남미 최대 시장입니다. ANVISA 규제 간소화로 진입 장벽이 낮아지면서 경쟁이 심화될 가능성이 있습니다.',
    insight: '브라질 시장 진출 시 ANVISA 신규 절차를 활용해 경쟁사보다 빠른 진입 전략 수립 가능합니다.',
    tags: ['ANVISA', 'Brazil', 'Class II', 'Market entry'],
    relatedLinks: [
      { label: 'ANVISA', url: 'https://www.gov.br/anvisa/en' },
      { label: 'RegAffairs Pro', url: 'https://www.regulatoryaffairsprofessionals.org/' },
    ],
    relevance: 'low',
    classsysActionPoint: '브라질 ANVISA 신규 허가 절차를 활용한 중남미 시장 진출 타당성 검토 착수',
  },
]

const REGULATORY_UPDATES = [
  { device: 'AI imaging support module', type: 'FDA planning', status: 'pending', date: '2026-05-04', region: 'USA' },
  { device: 'Next-gen HIFU workflow pack', type: 'CE planning', status: 'pending', date: '2026-05-03', region: 'EU' },
  { device: 'SaMD reporting layer', type: 'Registration complete', status: 'approved', date: '2026-05-02', region: 'USA' },
  { device: 'CLASSYS China submission watch', type: 'NMPA tracking', status: 'pending', date: '2026-04-28', region: 'China' },
  { device: 'Laser category expansion', type: 'CE approval', status: 'approved', date: '2026-04-25', region: 'EU' },
]

const CATEGORY_LABELS: Record<FilterKey, string> = {
  all: 'All',
  tech: 'Technology',
  ai: 'AI / SaMD',
  regulatory: 'Regulatory',
}

const CATEGORY_COLORS: Record<Article['category'], string> = {
  tech: 'bg-blue-100 text-blue-700',
  ai: 'bg-violet-100 text-violet-700',
  regulatory: 'bg-amber-100 text-amber-700',
}

export default function TechAiClient() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-05-07 09:10')
  const [detailArticle, setDetailArticle] = useState<Article | null>(null)
  const { data: articles = [], isLoading } = useMarketArticles({ category: 'tech_ai', limit: 30 })

  const filtered = filter === 'all' ? ARTICLES : ARTICLES.filter((article) => article.category === filter)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const now = new Date()
    setLastUpdated(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setRefreshing(false)
  }

  return (
    <div className="min-h-full bg-white">
      <MarketNav />

      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Tech & AI</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">Tech & AI Watch</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                기술 변화, AI 보조 기능, 규제 흐름을 제품 기획과 영업 관점에서 함께 해석하는 화면입니다.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap gap-2">
            {(['all', 'tech', 'ai', 'regulatory'] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  filter === key ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {key === 'tech' ? <Cpu className="h-3.5 w-3.5" /> : null}
                {key === 'ai' ? <Zap className="h-3.5 w-3.5" /> : null}
                {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article: MarketArticle) => (
                <a
                  key={article.id}
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  {article.thumbnail_url && (
                    <img
                      src={article.thumbnail_url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">{tag}</span>
                      ))}
                    </div>
                    <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
                    {article.summary_ko && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{article.summary_ko}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {article.source_name} · {article.published_at ? new Date(article.published_at).toLocaleDateString('ko-KR') : ''}
                    </p>
                  </div>
                </a>
              ))}
              {articles.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-12">기사 데이터를 불러오는 중입니다. 관리자가 새로고침을 실행해 주세요.</p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="sticky top-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Regulatory tracker</h2>
            <p className="mt-1 text-xs text-slate-400">Recent approval and planning signals</p>
            <div className="mt-4 space-y-3">
              {REGULATORY_UPDATES.map((item) => (
                <div key={`${item.device}-${item.date}`} className="flex items-start gap-3">
                  {item.status === 'approved' ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-slate-800">{item.device}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{item.type}</span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{item.region}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {detailArticle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setDetailArticle(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', CATEGORY_COLORS[detailArticle.category]].join(' ')}>
                      {CATEGORY_LABELS[detailArticle.category]}
                    </span>
                    <span className="text-xs text-slate-400">{detailArticle.region}</span>
                    <span className="text-xs text-slate-400">{detailArticle.date}</span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-slate-950">{detailArticle.title}</h2>
                </div>
                <button onClick={() => setDetailArticle(null)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Link className="h-4 w-4" />
                <span>Source:</span>
                <a href={detailArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">
                  {detailArticle.source}
                </a>
              </div>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{detailArticle.summary}</p>
              </section>

              <section className="rounded-2xl bg-slate-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detail</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{detailArticle.fullDetail}</p>
              </section>

              <section className="rounded-2xl bg-blue-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700">Business interpretation</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-950">{detailArticle.insight}</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailArticle.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Related links</h3>
                <div className="mt-2 space-y-2">
                  {detailArticle.relatedLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">{link.label}</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
