'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PanelLeft } from 'lucide-react'
import { useFormFields } from '@/hooks/useFormFields'
import { useFormSettings } from '@/hooks/useFormSettings'
import BuilderTabBar, { type BuilderTab } from './BuilderTabBar'
import BuilderSidebar from './BuilderSidebar'
import BuilderCanvas from './BuilderCanvas'
import SettingsPanel from './SettingsPanel'
import SaveButton from './SaveButton'

export default function FormBuilder() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BuilderTab>('edit')
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fieldState = useFormFields()
  const settings = useFormSettings()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push('/projects/new')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900 sm:text-base">Project Wizard 이후 폼 생성</span>
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="hidden max-w-xs truncate text-xs text-red-600 sm:inline">{error}</span>}
          <SaveButton
            title={settings.title}
            customSlug={settings.customSlug}
            fields={fieldState.fields}
            onError={setError}
            {...settings.toApiPayload()}
          />
        </div>
      </header>

      <BuilderTabBar activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'edit' && (
        <div className="relative flex flex-1 overflow-hidden">
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/30 sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div
            className={[
              'z-30 transition-transform duration-200',
              'fixed left-0 top-0 h-full sm:relative sm:translate-x-0 sm:z-auto',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0',
            ].join(' ')}
          >
            <BuilderSidebar onAddField={(type) => { fieldState.addField(type); setSidebarOpen(false) }} />
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
              {error && <span className="truncate text-xs text-red-600">{error}</span>}
            </div>

            <BuilderCanvas
              title={settings.title}
              onTitleChange={(value) => {
                settings.setTitle(value)
                setError('')
              }}
              fields={fieldState.fields}
              onUpdateField={fieldState.updateField}
              onRemoveField={fieldState.removeField}
              onDragEnd={fieldState.handleDragEnd}
            />
          </div>
        </div>
      )}

      {activeTab === 'settings' && <SettingsPanel settings={settings} />}
    </div>
  )
}
