'use client'

import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import { create } from 'zustand'
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

interface FormBuilderStore {
  initializedProjectId: string | null
  fields: FormField[]
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
  initialize: (project: InitialProject, initialFields: FormField[]) => void
  addField: (type: FieldType) => void
  removeField: (id: string) => void
  updateField: (id: string, patch: Partial<FormField>) => void
  handleDragEnd: (event: DragEndEvent) => void
  setTitle: (value: string) => void
  setCustomSlug: (value: string) => void
  setIsPublished: (value: boolean) => void
  setThemeColor: (value: string) => void
  setNotificationEmail: (value: string) => void
  setDeadline: (value: string) => void
  setMaxSubmissions: (value: string) => void
  setWebhookUrl: (value: string) => void
  setSubmissionMessage: (value: string) => void
  setAdminEmailTemplate: (value: string) => void
  setUserEmailTemplate: (value: string) => void
  setThumbnailUrl: (value: string) => void
  setLocaleSettings: (value: LocaleSettings) => void
  setSeoTitle: (value: string) => void
  setSeoDescription: (value: string) => void
  setSeoOgImage: (value: string) => void
}

export const useFormBuilderStore = create<FormBuilderStore>((set) => ({
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
  initialize: (project, initialFields) =>
    set((state) => {
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
    }),
  addField: (type) =>
    set((state) => ({
      fields: [...state.fields, createDefaultField(type, state.fields.length)],
    })),
  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== id).map((field, index) => ({ ...field, order_index: index })),
    })),
  updateField: (id, patch) =>
    set((state) => ({
      fields: state.fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    })),
  handleDragEnd: ({ active, over }) => {
    if (!over || active.id === over.id) return

    set((state) => {
      const oldIndex = state.fields.findIndex((field) => field.id === active.id)
      const newIndex = state.fields.findIndex((field) => field.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return state

      return {
        fields: arrayMove(state.fields, oldIndex, newIndex).map((field, index) => ({ ...field, order_index: index })),
      }
    })
  },
  setTitle: (value) => set({ title: value }),
  setCustomSlug: (value) => set({ customSlug: value }),
  setIsPublished: (value) => set({ isPublished: value }),
  setThemeColor: (value) => set({ themeColor: value }),
  setNotificationEmail: (value) => set({ notificationEmail: value }),
  setDeadline: (value) => set({ deadline: value }),
  setMaxSubmissions: (value) => set({ maxSubmissions: value }),
  setWebhookUrl: (value) => set({ webhookUrl: value }),
  setSubmissionMessage: (value) => set({ submissionMessage: value }),
  setAdminEmailTemplate: (value) => set({ adminEmailTemplate: value }),
  setUserEmailTemplate: (value) => set({ userEmailTemplate: value }),
  setThumbnailUrl: (value) => set({ thumbnailUrl: value }),
  setLocaleSettings: (value) => set({ localeSettings: value }),
  setSeoTitle: (value) => set({ seoTitle: value }),
  setSeoDescription: (value) => set({ seoDescription: value }),
  setSeoOgImage: (value) => set({ seoOgImage: value }),
}))

export function getFormBuilderState() {
  return useFormBuilderStore.getState()
}

export function buildProjectUpdatePayload(state: Pick<FormBuilderStore,
  'notificationEmail' |
  'themeColor' |
  'isPublished' |
  'deadline' |
  'maxSubmissions' |
  'webhookUrl' |
  'submissionMessage' |
  'adminEmailTemplate' |
  'userEmailTemplate' |
  'thumbnailUrl' |
  'localeSettings' |
  'seoTitle' |
  'seoDescription' |
  'seoOgImage'
>) {
  const payload: Record<string, unknown> = {
    notification_email: state.notificationEmail.trim() || null,
    theme_color: state.themeColor || '#111827',
    is_published: state.isPublished,
    deadline: state.deadline || null,
    max_submissions: state.maxSubmissions ? parseInt(state.maxSubmissions, 10) : null,
    webhook_url: state.webhookUrl.trim() || null,
    submission_message: state.submissionMessage.trim() || null,
    admin_email_template: isHtmlEmpty(state.adminEmailTemplate) ? null : state.adminEmailTemplate,
    user_email_template: isHtmlEmpty(state.userEmailTemplate) ? null : state.userEmailTemplate,
    thumbnail_url: state.thumbnailUrl || null,
    locale_settings: state.localeSettings,
  }

  if (state.seoTitle || state.seoDescription || state.seoOgImage) {
    payload.seo_title = state.seoTitle.trim() || null
    payload.seo_description = state.seoDescription.trim() || null
    payload.seo_og_image = state.seoOgImage.trim() || null
  }

  return payload
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
