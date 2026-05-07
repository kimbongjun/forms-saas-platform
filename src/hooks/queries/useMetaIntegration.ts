'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type IntegrationStatus = {
  envConfigured: boolean
  connection: null | {
    provider: string
    status: string
    facebook_user_id: string | null
    facebook_page_id: string | null
    facebook_page_name: string | null
    instagram_business_account_id: string | null
    instagram_username: string | null
    scopes: string[] | null
    token_expires_at: string | null
    last_validated_at: string | null
    created_at: string
    updated_at: string
  }
}

export type DemoResponse = {
  hashtag: string
  permissions: Array<{ permission: string; status: string }>
  pageCount: number
  profile?: {
    id: string
    username?: string
    name?: string
    profile_picture_url?: string
    biography?: string
    website?: string
    followers_count?: number
    media_count?: number
  }
  recentMedia: Array<{
    id: string
    caption?: string
    media_type?: string
    media_url?: string
    thumbnail_url?: string
    permalink?: string
    timestamp?: string
    like_count?: number
    comments_count?: number
  }>
  hashtagMedia: Array<{
    id: string
    caption?: string
    media_type?: string
    media_url?: string
    thumbnail_url?: string
    permalink?: string
    timestamp?: string
    like_count?: number
    comments_count?: number
  }>
}

const META_STATUS_KEY = ['meta-integration-status'] as const

async function fetchMetaStatus(): Promise<IntegrationStatus> {
  const res = await fetch('/api/integrations/meta/status', { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to load Meta status')
  return json
}

async function fetchMetaDemo(hashtag: string): Promise<DemoResponse> {
  const res = await fetch(`/api/integrations/meta/demo?hashtag=${encodeURIComponent(hashtag)}`, {
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to run Meta demo')
  return json
}

async function postDisconnect(): Promise<void> {
  const res = await fetch('/api/integrations/meta/disconnect', { method: 'POST' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to disconnect')
}

export function useMetaStatus() {
  return useQuery({
    queryKey: META_STATUS_KEY,
    queryFn: fetchMetaStatus,
    staleTime: 30 * 1000,  // 30초 — 연결 상태는 자주 변하지 않음
  })
}

export function useMetaDemo(hashtag: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchMetaDemo(hashtag),
    onSuccess: () => {
      // 데모 완료 후 status 재조회 (last_validated_at 갱신 반영)
      void queryClient.invalidateQueries({ queryKey: META_STATUS_KEY })
    },
  })
}

export function useMetaDisconnect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postDisconnect,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: META_STATUS_KEY })
    },
  })
}
