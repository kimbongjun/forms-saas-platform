'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, Copy, Globe, Loader2, Upload, X } from 'lucide-react'
import { PRESET_COLORS, TEMPLATE_VARS, INPUT_CLASS } from '@/constants/builder'
import { ALL_LOCALES, DEFAULT_LOCALE_STRINGS, LOCALE_LABELS } from '@/constants/locale'
import type { Locale, LocaleStrings } from '@/constants/locale'
import type { LocaleSettings } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import { uploadThumbnail } from '@/utils/supabase/storage'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

type Settings = {
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

interface SettingsPanelProps {
  settings: Settings
  slug?: string
}

const OVERRIDE_KEYS: Array<{
  key: keyof LocaleStrings
  label: string
  placeholder: (locale: Locale) => string
}> = [
  { key: 'submit', label: '제출 버튼', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].submit },
  { key: 'submitting', label: '제출 중 문구', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].submitting },
  { key: 'submitted_title', label: '완료 제목', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].submitted_title },
  { key: 'submitted_subtitle', label: '완료 설명', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].submitted_subtitle },
  { key: 'required_error', label: '필수 입력 오류', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].required_error },
  { key: 'select_placeholder', label: '드롭다운 안내', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].select_placeholder },
  { key: 'agree_label', label: '동의 체크 문구', placeholder: (locale) => DEFAULT_LOCALE_STRINGS[locale].agree_label },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

export default function SettingsPanel({ settings, slug }: SettingsPanelProps) {
  const [slugCopied, setSlugCopied] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(false)
  const [expandedLocale, setExpandedLocale] = useState<Locale | null>(null)
  const thumbnailRef = useRef<HTMLInputElement>(null)

  const localeSettings = settings.localeSettings

  async function handleThumbnailFile(file: File) {
    setThumbnailLoading(true)
    try {
      const supabase = createClient()
      const url = await uploadThumbnail(supabase, file)
      settings.setThumbnailUrl(url)
    } catch (error) {
      console.error('[SettingsPanel] thumbnail upload failed:', error)
    } finally {
      setThumbnailLoading(false)
    }
  }

  function copySlug() {
    if (!slug) return
    navigator.clipboard.writeText(slug)
    setSlugCopied(true)
    setTimeout(() => setSlugCopied(false), 1500)
  }

  function toggleAvailableLocale(locale: Locale) {
    const nextLocales = localeSettings.available_locales.includes(locale)
      ? localeSettings.available_locales.filter((item) => item !== locale)
      : [...localeSettings.available_locales, locale]

    if (nextLocales.length === 0) return

    settings.setLocaleSettings({
      ...localeSettings,
      available_locales: nextLocales,
      default_locale: nextLocales.includes(localeSettings.default_locale)
        ? localeSettings.default_locale
        : nextLocales[0],
    })
  }

  function setDefaultLocale(locale: Locale) {
    settings.setLocaleSettings({ ...localeSettings, default_locale: locale })
  }

  function updateOverride(locale: Locale, key: keyof LocaleStrings, value: string) {
    settings.setLocaleSettings({
      ...localeSettings,
      overrides: {
        ...localeSettings.overrides,
        [locale]: {
          ...(localeSettings.overrides[locale] ?? {}),
          [key]: value,
        },
      },
    })
  }

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-start gap-8">
        <div className="space-y-6">
          <Section title="테마 컬러">
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => settings.setThemeColor(color)}
                  style={{ backgroundColor: color }}
                  className={`h-8 w-full rounded-lg transition-all ${
                    settings.themeColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.themeColor}
                onChange={(event) => settings.setThemeColor(event.target.value)}
                className="h-9 w-24 cursor-pointer rounded-lg border border-gray-200"
              />
              <span className="text-xs text-gray-500">{settings.themeColor}</span>
            </div>
          </Section>

          <Section title="썸네일">
            {settings.thumbnailUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.thumbnailUrl} alt="thumbnail preview" className="max-h-40 w-full rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => settings.setThumbnailUrl('')}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailRef.current?.click()}
                disabled={thumbnailLoading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600 disabled:opacity-50"
              >
                {thumbnailLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                <span className="text-xs">{thumbnailLoading ? '업로드 중...' : '이미지 업로드'}</span>
              </button>
            )}
            <input
              ref={thumbnailRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleThumbnailFile(file)
              }}
            />
          </Section>

          <Section title="운영 설정">
            {slug ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Slug</p>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="flex-1 text-sm text-gray-500">{slug}</span>
                  <button type="button" onClick={copySlug} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                    <Copy className="h-3.5 w-3.5" />
                    {slugCopied ? '복사됨' : '복사'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Slug</p>
                <input
                  type="text"
                  value={settings.customSlug}
                  onChange={(event) => settings.setCustomSlug(event.target.value.replace(/[^a-z0-9-]/g, ''))}
                  placeholder="비워두면 자동 생성"
                  className={INPUT_CLASS}
                />
              </div>
            )}

            <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">공개 상태</p>
                <p className="text-xs text-gray-400">폼 접근 가능 여부를 제어합니다.</p>
              </div>
              <input type="checkbox" checked={settings.isPublished} onChange={(event) => settings.setIsPublished(event.target.checked)} />
            </label>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">알림 이메일</p>
              <input type="email" value={settings.notificationEmail} onChange={(event) => settings.setNotificationEmail(event.target.value)} className={INPUT_CLASS} placeholder="alerts@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">마감일</p>
                <input type="datetime-local" value={settings.deadline} onChange={(event) => settings.setDeadline(event.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">최대 응답 수</p>
                <input type="number" min="1" value={settings.maxSubmissions} onChange={(event) => settings.setMaxSubmissions(event.target.value)} className={INPUT_CLASS} placeholder="제한 없음" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Webhook URL</p>
              <input type="url" value={settings.webhookUrl} onChange={(event) => settings.setWebhookUrl(event.target.value)} className={INPUT_CLASS} placeholder="https://..." />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">제출 완료 메시지</p>
              <textarea rows={4} value={settings.submissionMessage} onChange={(event) => settings.setSubmissionMessage(event.target.value)} className={`${INPUT_CLASS} resize-y`} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="SEO 설정">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">SEO Title</p>
              <input type="text" value={settings.seoTitle} onChange={(event) => settings.setSeoTitle(event.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">SEO Description</p>
              <textarea rows={4} value={settings.seoDescription} onChange={(event) => settings.setSeoDescription(event.target.value)} className={`${INPUT_CLASS} resize-y`} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">OG Image URL</p>
              <input type="url" value={settings.seoOgImage} onChange={(event) => settings.setSeoOgImage(event.target.value)} className={INPUT_CLASS} placeholder="https://..." />
            </div>
          </Section>

          <Section title="이메일 템플릿">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
              사용 가능 변수: {TEMPLATE_VARS.join(', ')}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">관리자 알림 메일</p>
              <RichTextEditor content={settings.adminEmailTemplate} onChange={settings.setAdminEmailTemplate} height="260px" />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">사용자 발송 메일</p>
              <RichTextEditor content={settings.userEmailTemplate} onChange={settings.setUserEmailTemplate} height="260px" />
            </div>
          </Section>

          <Section title="다국어 설정">
            <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Globe className="h-4 w-4" />
                다국어 사용
              </div>
              <input
                type="checkbox"
                checked={localeSettings.enabled}
                onChange={(event) => settings.setLocaleSettings({ ...localeSettings, enabled: event.target.checked })}
              />
            </label>

            {localeSettings.enabled && (
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {ALL_LOCALES.map((locale) => {
                    const checked = localeSettings.available_locales.includes(locale)
                    const expanded = expandedLocale === locale

                    return (
                      <div key={locale} className="rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setExpandedLocale(expanded ? null : locale)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{LOCALE_LABELS[locale]}</p>
                            <p className="text-xs text-gray-400">{locale}</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="border-t border-gray-100 px-4 py-3 text-sm">
                          <label className="flex items-center justify-between py-1">
                            <span>사용</span>
                            <input type="checkbox" checked={checked} onChange={() => toggleAvailableLocale(locale)} />
                          </label>
                          <label className="flex items-center justify-between py-1">
                            <span>기본 언어</span>
                            <input
                              type="radio"
                              name="default-locale"
                              checked={localeSettings.default_locale === locale}
                              onChange={() => setDefaultLocale(locale)}
                              disabled={!checked}
                            />
                          </label>
                        </div>

                        {expanded && checked && (
                          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                            {OVERRIDE_KEYS.map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
                                <input
                                  type="text"
                                  value={localeSettings.overrides[locale]?.[key] ?? ''}
                                  onChange={(event) => updateOverride(locale, key, event.target.value)}
                                  placeholder={placeholder(locale)}
                                  className={INPUT_CLASS}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </main>
  )
}
