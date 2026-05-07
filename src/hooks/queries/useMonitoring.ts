'use client'

import { useQuery } from '@tanstack/react-query'

export type MonitoringSite = {
  id: string
  name: string
  url: string
  created_at: string
  [key: string]: unknown
}

export type SslResult = {
  valid: boolean
  daysUntilExpiry?: number
  issuer?: string
  expiresAt?: string
  error?: string
}

export type MonitoringHistory = {
  id: string
  site_id: string
  checked_at: string
  status: string
  response_time_ms?: number
  [key: string]: unknown
}

async function fetchSites(): Promise<MonitoringSite[]> {
  const res = await fetch('/api/monitoring/sites')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch monitoring sites')
  return json
}

async function fetchSiteHistory(siteId: string): Promise<MonitoringHistory[]> {
  const res = await fetch(`/api/monitoring/history/${siteId}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch history')
  return json
}

async function fetchSslStatus(siteId: string): Promise<SslResult> {
  const res = await fetch(`/api/monitoring/ssl?siteId=${siteId}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch SSL status')
  return json
}

async function fetchSitemapStatus(siteId: string) {
  const res = await fetch(`/api/monitoring/sitemap/${siteId}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch sitemap')
  return json
}

export const monitoringKeys = {
  all: ['monitoring'] as const,
  sites: () => [...monitoringKeys.all, 'sites'] as const,
  history: (siteId: string) => [...monitoringKeys.all, 'history', siteId] as const,
  ssl: (siteId: string) => [...monitoringKeys.all, 'ssl', siteId] as const,
  sitemap: (siteId: string) => [...monitoringKeys.all, 'sitemap', siteId] as const,
}

export function useMonitoringSites() {
  return useQuery({
    queryKey: monitoringKeys.sites(),
    queryFn: fetchSites,
    staleTime: 60 * 1000,
  })
}

export function useMonitoringHistory(siteId: string | null) {
  return useQuery({
    queryKey: monitoringKeys.history(siteId ?? ''),
    queryFn: () => fetchSiteHistory(siteId!),
    enabled: Boolean(siteId),
    staleTime: 2 * 60 * 1000,
  })
}

export function useSslStatus(siteId: string | null) {
  return useQuery({
    queryKey: monitoringKeys.ssl(siteId ?? ''),
    queryFn: () => fetchSslStatus(siteId!),
    enabled: Boolean(siteId),
    staleTime: 10 * 60 * 1000, // SSL은 10분 캐시
  })
}

export function useSitemapStatus(siteId: string | null) {
  return useQuery({
    queryKey: monitoringKeys.sitemap(siteId ?? ''),
    queryFn: () => fetchSitemapStatus(siteId!),
    enabled: Boolean(siteId),
    staleTime: 5 * 60 * 1000,
  })
}
