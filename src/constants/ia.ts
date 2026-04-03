export interface WorkspaceHub {
  key: 'dashboard' | 'projects'
  href: string
  label: string
  description: string
}

export interface ProjectNavItem {
  key: string
  label: string
  description: string
  href: (projectId: string) => string
}

export interface ProjectNavGroup {
  label: string
  items: ProjectNavItem[]
}

export const WORKSPACE_HUBS: WorkspaceHub[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    description: '성과 요약 & 퀵 액션',
  },
  {
    key: 'projects',
    href: '/projects',
    label: 'Projects',
    description: '핵심 워크스페이스',
  }
]

export const PROJECT_NAV_GROUPS: ProjectNavGroup[] = [
  {
    label: 'Execution',
    items: [
      {
        key: 'execution/tasks',
        label: 'Task & WBS',
        description: '칸반 방식 업무 관리',
        href: (projectId) => `/projects/${projectId}/execution/tasks`,
      },
      {
        key: 'execution/forms',
        label: 'Form Builder',
        description: '프로젝트 전용 폼 생성',
        href: (projectId) => `/projects/${projectId}/execution/forms`,
      },
      {
        key: 'execution/live-responses',
        label: 'Live Responses',
        description: '실시간 응답 및 리드 관리',
        href: (projectId) => `/projects/${projectId}/execution/live-responses`,
      },
    ],
  },
]
