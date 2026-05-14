// src/lib/prompts/some-content.ts

export const SOME_CONTENT_SYSTEM_PROMPT = `당신은 한국 소셜미디어 빅데이터 분석 전문가입니다.
브랜드 키워드의 채널별 반응 패턴을 분석하고 마케팅 전략 방향성을 도출합니다.
반드시 JSON만 출력하세요. 마크다운이나 설명 텍스트를 포함하지 마세요.`

export interface InsightInput {
  keyword: string
  mentionsByChannel: Record<string, number>
  sentimentDistribution: { positive: number; negative: number; neutral: number }
  topKeywords: string[]
  metrics?: {
    trend: string
    growthRate: number
    volatility: number
    avg: number
    recent3Avg: number
    maxMonth: string
    minMonth: string
  }
}

export interface InsightOutput {
  trend_summary: string
  opportunities: string[]
  risks: string[]
  recommendations: string[]
}

export function buildInsightPrompt(input: InsightInput): string {
  const trendDesc = input.metrics
    ? `트렌드: ${input.metrics.trend === 'up' ? '상승세' : input.metrics.trend === 'down' ? '하락세' : '보합세'}, 성장률 ${input.metrics.growthRate > 0 ? '+' : ''}${input.metrics.growthRate}%, 변동성 ${input.metrics.volatility}%`
    : ''

  return `키워드 "${input.keyword}" 소셜 빅데이터 분석 결과를 바탕으로 마케팅 인사이트를 제공하세요.

채널별 언급량: ${JSON.stringify(input.mentionsByChannel)}
감성 분포: 긍정 ${input.sentimentDistribution.positive}% / 부정 ${input.sentimentDistribution.negative}% / 중립 ${input.sentimentDistribution.neutral}%
주요 키워드: ${input.topKeywords.slice(0, 20).join(', ')}
${trendDesc}

JSON 형식으로만 응답:
{"trend_summary":"2~3문장 트렌드 해석","opportunities":["기회요인1","기회요인2","기회요인3"],"risks":["리스크1","리스크2"],"recommendations":["실행방안1","실행방안2","실행방안3"]}`
}

export interface CrossChannelInput {
  keyword: string
  trendData: unknown
  mentionSummary: unknown
  topPosts: { channel: string; content: string; sentiment: string | null }[]
}

export interface CrossChannelOutput {
  narrative: string
  channel_insights: { channel: string; insight: string }[]
  consumer_pattern: string
  priority_keywords: string[]
}

export function buildCrossChannelPrompt(input: CrossChannelInput): string {
  return `키워드 "${input.keyword}"의 트렌드와 멀티채널 데이터를 종합 분석하세요.

트렌드 데이터: ${JSON.stringify(input.trendData)}
채널별 언급 요약: ${JSON.stringify(input.mentionSummary)}
주요 포스트: ${JSON.stringify(input.topPosts.slice(0, 10))}

JSON 형식으로만 응답:
{"narrative":"4~6문장 전체 트렌드 내러티브","channel_insights":[{"channel":"","insight":""}],"consumer_pattern":"소비자 반응 패턴 2~3문장","priority_keywords":["키워드1","키워드2","키워드3"]}`
}
