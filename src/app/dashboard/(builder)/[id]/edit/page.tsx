import { redirect } from 'next/navigation'

interface LegacyEditPageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyEditPage({ params }: LegacyEditPageProps) {
  const { id } = await params
  redirect(`/projects/${id}/execution/forms`)
}
