import WorkspaceShell from '@/components/workspace/WorkspaceShell'

export const metadata = { title: 'Market Intelligence — 글로벌 의료기기 시장 동향' }

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
