import { redirect } from 'next/navigation'

interface LegacyResponsesStatsPageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyResponsesStatsPage({ params }: LegacyResponsesStatsPageProps) {
  const { id } = await params
  redirect(`/projects/${id}/execution/live-responses/stats`)
}
