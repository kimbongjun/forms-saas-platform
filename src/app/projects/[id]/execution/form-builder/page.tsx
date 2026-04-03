import { redirect } from 'next/navigation'

interface LegacyFormBuilderPageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyFormBuilderPage({ params }: LegacyFormBuilderPageProps) {
  const { id } = await params
  redirect(`/projects/${id}/execution/forms`)
}
