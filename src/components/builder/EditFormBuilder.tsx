'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, PanelLeft } from 'lucide-react'
import BuilderTabBar, { type BuilderTab } from './BuilderTabBar'
import BuilderSidebar from './BuilderSidebar'
import BuilderCanvas from './BuilderCanvas'
import { getFormBuilderState, useFormBuilderStore } from '@/stores/form-builder-store'
import type { FormField, Project } from '@/types/database'

const SettingsPanel = dynamic(() => import('./SettingsPanel'))
const ResponsesTab = dynamic(() => import('./ResponsesTab'))

interface EditFormBuilderProps {
  project: Project & { id: string }
  initialFields: FormField[]
  initialDeadline: string
}

export default function EditFormBuilder({ project, initialFields, initialDeadline }: EditFormBuilderProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BuilderTab>('edit')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initialize = useFormBuilderStore((state) => state.initialize)
  const title = useFormBuilderStore((state) => state.title)
  const fields = useFormBuilderStore((state) => state.fields)
  const setTitle = useFormBuilderStore((state) => state.setTitle)
  const addField = useFormBuilderStore((state) => state.addField)
  const updateField = useFormBuilderStore((state) => state.updateField)
  const removeField = useFormBuilderStore((state) => state.removeField)
  const handleDragEnd = useFormBuilderStore((state) => state.handleDragEnd)
  const settings = useFormBuilderStore((state) => ({
    title: state.title,
    customSlug: state.customSlug,
    isPublished: state.isPublished,
    themeColor: state.themeColor,
    notificationEmail: state.notificationEmail,
    deadline: state.deadline,
    maxSubmissions: state.maxSubmissions,
    webhookUrl: state.webhookUrl,
    submissionMessage: state.submissionMessage,
    adminEmailTemplate: state.adminEmailTemplate,
    userEmailTemplate: state.userEmailTemplate,
    thumbnailUrl: state.thumbnailUrl,
    localeSettings: state.localeSettings,
    seoTitle: state.seoTitle,
    seoDescription: state.seoDescription,
    seoOgImage: state.seoOgImage,
    setTitle: state.setTitle,
    setCustomSlug: state.setCustomSlug,
    setIsPublished: state.setIsPublished,
    setThemeColor: state.setThemeColor,
    setNotificationEmail: state.setNotificationEmail,
    setDeadline: state.setDeadline,
    setMaxSubmissions: state.setMaxSubmissions,
    setWebhookUrl: state.setWebhookUrl,
    setSubmissionMessage: state.setSubmissionMessage,
    setAdminEmailTemplate: state.setAdminEmailTemplate,
    setUserEmailTemplate: state.setUserEmailTemplate,
    setThumbnailUrl: state.setThumbnailUrl,
    setLocaleSettings: state.setLocaleSettings,
    setSeoTitle: state.setSeoTitle,
    setSeoDescription: state.setSeoDescription,
    setSeoOgImage: state.setSeoOgImage,
  }))

  useEffect(() => {
    initialize({ ...project, initialDeadline }, initialFields)
  }, [initialize, initialDeadline, initialFields, project])

  async function handleUpdate() {
    const state = getFormBuilderState()

    if (!state.title.trim()) {
      setError('프로젝트 제목을 입력해 주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.title.trim(),
          notificationEmail: state.notificationEmail,
          themeColor: state.themeColor,
          isPublished: state.isPublished,
          deadline: state.deadline || null,
          maxSubmissions: state.maxSubmissions ? parseInt(state.maxSubmissions, 10) : null,
          webhookUrl: state.webhookUrl,
          submissionMessage: state.submissionMessage,
          adminEmailTemplate: state.adminEmailTemplate,
          userEmailTemplate: state.userEmailTemplate,
          thumbnailUrl: state.thumbnailUrl,
          localeSettings: state.localeSettings,
          seoTitle: state.seoTitle,
          seoDescription: state.seoDescription,
          seoOgImage: state.seoOgImage,
          fields: state.fields,
        }),
      })

      if (!response.ok) {
        const json = await response.json().catch(() => null)
        throw new Error(json?.error ?? '프로젝트 저장에 실패했습니다.')
      }

      setSaved(true)
      router.refresh()
      setTimeout(() => router.push(`/projects/${project.id}`), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-green-600">
        <CheckCircle2 className="h-14 w-14" />
        <p className="text-lg font-semibold">수정이 완료되었습니다.</p>
        <p className="text-sm text-gray-500">프로젝트 화면으로 이동합니다.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/projects/${project.id}`)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-base font-semibold text-gray-900">프로젝트 편집</span>
            <span className="ml-2 text-xs text-gray-400">{project.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="max-w-xs truncate text-xs text-red-600">{error}</span>}
          <a
            href={`/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            공개 폼 보기
          </a>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? '저장 중...' : '변경 저장'}
          </button>
        </div>
      </header>

      <BuilderTabBar activeTab={activeTab} onChange={setActiveTab} showResponses />

      {activeTab === 'edit' && (
        <div className="relative flex flex-1 overflow-hidden">
          {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/30 sm:hidden" onClick={() => setSidebarOpen(false)} />}

          <div
            className={[
              'z-30 transition-transform duration-200',
              'fixed left-0 top-0 h-full sm:relative sm:translate-x-0 sm:z-auto',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0',
            ].join(' ')}
          >
            <BuilderSidebar
              onAddField={(type) => {
                addField(type)
                setSidebarOpen(false)
              }}
            />
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2 sm:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <PanelLeft className="h-3.5 w-3.5" />
                필드 추가
              </button>
            </div>

            <BuilderCanvas
              title={title}
              onTitleChange={(value) => {
                setTitle(value)
                setError('')
              }}
              fields={fields}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onDragEnd={handleDragEnd}
              titlePlaceholder=""
            />
          </div>
        </div>
      )}

      {activeTab === 'settings' && <SettingsPanel settings={settings} slug={project.slug} />}
      {activeTab === 'responses' && <ResponsesTab projectId={project.id} projectSlug={project.slug} fields={fields} />}
    </div>
  )
}
