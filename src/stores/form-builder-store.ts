'use client'

import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FieldType, FormField, LocaleSettings, Project } from '@/types/database'
import { generateId } from '@/constants/builder'

const DEFAULT_LOCALE_SETTINGS: LocaleSettings = {
  enabled: false,
  default_locale: 'ko',
  available_locales: ['ko'],
  overrides: {},
}

function isHtmlEmpty(html: string) {
  return !html || html.replace(/<[^>]*>/g, '').trim() === ''
}

function createDefaultField(type: FieldType, orderIndex: number): FormField {
  const needsOptions = ['select', 'radio', 'checkbox_group'].includes(type)
  const needsContent = ['html', 'map', 'youtube', 'text_block', 'image', 'divider'].includes(type)

  return {
    id: generateId(),
    label: '',
    type,
    required: false,
    order_index: orderIndex,
    options: needsOptions ? [''] : undefined,
    content:
      type === 'table'
        ? JSON.stringify({ headers: ['컬럼 1', '컬럼 2'], rows: [['', '']] })
        : type === 'rating'
          ? '5'
          : needsContent
            ? ''
            : undefined,
  }
}

function normalizeFields(fields: FormField[]) {
  return fields.map((field, index) => ({ ...field, order_index: index }))
}

type InitialProject = Partial<Project> & { id?: string; initialDeadline?: string }

// 모든 설정 가능한 스칼라 상태를 묶은 타입 — updateMeta 의 patch 타입으로 사용
export type FormBuilderMeta = {
  title: string
  customSlug: string
  isPublished: boolean
  themeColor: string
  notificationEmail: string
  deadline: string
  maxSubmissions: string
  webhookUrl: string
  submissionMessage: string
  adminEmailTemplate: string
  userEmailTemplate: string
  thumbnailUrl: string
  localeSettings: LocaleSettings
  seoTitle: string
  seoDescription: string
  seoOgImage: string
}

interface FormBuilderStore extends FormBuilderMeta {
  initializedProjectId: string | null
  fields: FormField[]
  // ── 필드 액션 ──────────────────────────────────────────────────
  initialize: (project: InitialProject, initialFields: FormField[]) => void
  addField: (type: FieldType) => void
  removeField: (id: string) => void
  updateField: (id: string, patch: Partial<FormField>) => void
  handleDragEnd: (event: DragEndEvent) => void
  // ── 설정 배치 업데이트 ─────────────────────────────────────────
  /** 개별 setter 대신 사용. 여러 필드를 한 번에 업데이트해 리렌더를 최소화함 */
  updateMeta: (patch: Partial<FormBuilderMeta>) => void
}

export const useFormBuilderStore = create<FormBuilderStore>()(
  devtools(
    (set) => ({
      // ── 초기 상태 ──────────────────────────────────────────────
      initializedProjectId: null,
      fields: [],
      title: '',
      customSlug: '',
      isPublished: true,
      themeColor: '#111827',
      notificationEmail: '',
      deadline: '',
      maxSubmissions: '',
      webhookUrl: '',
      submissionMessage: '',
      adminEmailTemplate: '',
      userEmailTemplate: '',
      thumbnailUrl: '',
      localeSettings: DEFAULT_LOCALE_SETTINGS,
      seoTitle: '',
      seoDescription: '',
      seoOgImage: '',

      // ── 액션 ──────────────────────────────────────────────────
      initialize: (project, initialFields) =>
        set(
          (state) => {
            if (state.initializedProjectId === (project.id ?? null)) return state
            return {
              initializedProjectId: project.id ?? null,
              fields: normalizeFields(initialFields),
              title: project.title ?? '',
              customSlug: '',
              isPublished: project.is_published ?? true,
              themeColor: project.theme_color ?? '#111827',
              notificationEmail: project.notification_email ?? '',
              deadline: project.initialDeadline ?? '',
              maxSubmissions: project.max_submissions != null ? String(project.max_submissions) : '',
              webhookUrl: project.webhook_url ?? '',
              submissionMessage: project.submission_message ?? '',
              adminEmailTemplate: project.admin_email_template ?? '',
              userEmailTemplate: project.user_email_template ?? '',
              thumbnailUrl: project.thumbnail_url ?? '',
              localeSettings: project.locale_settings ?? DEFAULT_LOCALE_SETTINGS,
              seoTitle: project.seo_title ?? '',
              seoDescription: project.seo_description ?? '',
              seoOgImage: project.seo_og_image ?? '',
            }
          },
          false,
          'initialize',
        ),

      addField: (type) =>
        set(
          (state) => ({
            fields: [...state.fields, createDefaultField(type, state.fields.length)],
          }),
          false,
          'addField',
        ),

      removeField: (id) =>
        set(
          (state) => ({
            fields: state.fields
              .filter((f) => f.id !== id)
              .map((f, i) => ({ ...f, order_index: i })),
          }),
          false,
          'removeField',
        ),

      updateField: (id, patch) =>
        set(
          (state) => ({
            fields: state.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
          }),
          false,
          'updateField',
        ),

      handleDragEnd: ({ active, over }) => {
        if (!over || active.id === over.id) return
        set(
          (state) => {
            const oldIndex = state.fields.findIndex((f) => f.id === active.id)
            const newIndex = state.fields.findIndex((f) => f.id === over.id)
            if (oldIndex < 0 || newIndex < 0) return state
            return {
              fields: arrayMove(state.fields, oldIndex, newIndex).map((f, i) => ({
                ...f,
                order_index: i,
              })),
            }
          },
          false,
          'handleDragEnd',
        )
      },

      updateMeta: (patch) => set(patch, false, 'updateMeta'),
    }),
    { name: 'FormBuilderStore' },
  ),
)

// ── 셀렉터 함수 ────────────────────────────────────────────────────
// 컴포넌트에서 인라인 셀렉터를 반복 작성하는 대신 임포트해서 사용
export const selectFields = (s: FormBuilderStore) => s.fields
export const selectTitle = (s: FormBuilderStore) => s.title
export const selectMeta = (s: FormBuilderStore): FormBuilderMeta => ({
  title: s.title,
  customSlug: s.customSlug,
  isPublished: s.isPublished,
  themeColor: s.themeColor,
  notificationEmail: s.notificationEmail,
  deadline: s.deadline,
  maxSubmissions: s.maxSubmissions,
  webhookUrl: s.webhookUrl,
  submissionMessage: s.submissionMessage,
  adminEmailTemplate: s.adminEmailTemplate,
  userEmailTemplate: s.userEmailTemplate,
  thumbnailUrl: s.thumbnailUrl,
  localeSettings: s.localeSettings,
  seoTitle: s.seoTitle,
  seoDescription: s.seoDescription,
  seoOgImage: s.seoOgImage,
})

// ── 저장 전 payload 변환 헬퍼 ──────────────────────────────────────
export function getFormBuilderState() {
  return useFormBuilderStore.getState()
}

export function isHtmlFieldEmpty(html: string) {
  return isHtmlEmpty(html)
}

export function buildFormFieldRows(fields: FormField[], projectId: string) {
  return fields.map((field) => {
    const row: Record<string, unknown> = {
      id: field.id,
      project_id: projectId,
      label: field.label.trim() || '(제목 없음)',
      description: field.description ?? null,
      type: field.type,
      required: field.required,
      order_index: field.order_index,
      options: field.options ?? null,
      content: field.content ?? null,
    }
    if (field.logic != null) row.logic = field.logic
    return row
  })
}
