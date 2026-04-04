import { redirect } from 'next/navigation'

interface LegacyResponsesPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function LegacyResponsesPage({ params, searchParams }: LegacyResponsesPageProps) {
  const [{ id }, { page }] = await Promise.all([params, searchParams])
  const nextUrl = page ? `/projects/${id}/execution/forms?page=${page}` : `/projects/${id}/execution/forms`
  redirect(nextUrl)
}
