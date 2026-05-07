'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const someContentKeys = {
  all: ['some-content'] as const,
  keywords: () => [...someContentKeys.all, 'keywords'] as const,
  mentions: (from: string, to: string) => [...someContentKeys.all, 'mentions', from, to] as const,
  posts: (from: string, to: string) => [...someContentKeys.all, 'posts', from, to] as const,
}

async function fetchKeywords() {
  const res = await fetch('/api/some-content/keywords')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch keywords')
  return json
}

async function fetchMentions(from: string, to: string) {
  const res = await fetch(`/api/some-content/mentions?from=${from}&to=${to}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch mentions')
  return json
}

async function fetchPosts(from: string, to: string) {
  const res = await fetch(`/api/some-content/posts?from=${from}&to=${to}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch posts')
  return json
}

export function useSomeContentKeywords() {
  return useQuery({
    queryKey: someContentKeys.keywords(),
    queryFn: fetchKeywords,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSomeContentMentions(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: someContentKeys.mentions(from, to),
    queryFn: () => fetchMentions(from, to),
    enabled: enabled && Boolean(from) && Boolean(to),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSomeContentPosts(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: someContentKeys.posts(from, to),
    queryFn: () => fetchPosts(from, to),
    enabled: enabled && Boolean(from) && Boolean(to),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSyncMentions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/some-content/mentions/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync failed')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: someContentKeys.all })
    },
  })
}

export function useAddKeyword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (keyword: string) => {
      const res = await fetch('/api/some-content/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to add keyword')
      return json
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: someContentKeys.keywords() })
    },
  })
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/some-content/keywords?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete keyword')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: someContentKeys.keywords() })
    },
  })
}
