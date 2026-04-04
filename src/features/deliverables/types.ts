export type DeliverablePlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'other'

export interface ParsedDeliverable {
  platform: DeliverablePlatform
  url: string
  title: string
  thumbnail_url: string | null
  published_at: string | null
  views: number
  likes: number
  comments: number
  shares: number
  parsed_fields: {
    title: boolean
    thumbnail: boolean
    stats: boolean
    published_at: boolean
  }
  notice: string | null
}
