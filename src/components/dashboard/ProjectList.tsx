'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart2,
  Calendar,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Loader2,
  Plus,
  SquarePen,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Project {
  id: string
  title: string
  slug: string
  banner_url: string | null
  thumbnail_url: string | null
  created_at: string
  created_at_label: string
  is_published: boolean
  fieldCount: number
}

interface ProjectListProps {
  projects: Project[]
}

export default function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [confirmBulk, setConfirmBulk] = useState(false)

  const allSelected = projects.length > 0 && selected.size === projects.length

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(projects.map((project) => project.id)))
  }

  async function deleteProjects(ids: string[]) {
    const supabase = createClient()
    setDeletingIds(new Set(ids))

    try {
      const { error } = await supabase.from('projects').delete().in('id', ids)
      if (error) throw error

      setSelected((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      startTransition(() => router.refresh())
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeletingIds(new Set())
    }
  }

  async function handleDeleteOne(id: string, title: string) {
    if (!window.confirm(`'${title}' 프로젝트를 삭제하시겠습니까?\n\n연결된 필드와 제출 데이터도 함께 삭제됩니다.`)) {
      return
    }

    await deleteProjects([id])
  }

  async function handleBulkDelete() {
    await deleteProjects(Array.from(selected))
    setConfirmBulk(false)
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id)

    try {
      const response = await fetch('/api/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error)

      startTransition(() => router.refresh())
    } catch (err) {
      alert(err instanceof Error ? err.message : '복제에 실패했습니다.')
    } finally {
      setDuplicatingId(null)
    }
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
        <FileText className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-base font-medium text-gray-500">아직 프로젝트가 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">Project Wizard로 새 프로젝트를 시작해 보세요.</p>
        <Link
          href="/projects/new"
          className="mt-6 flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          첫 프로젝트 만들기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 select-none">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded accent-gray-900" />
          전체 선택
          {selected.size > 0 && (
            <span className="ml-1 rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">{selected.size}</span>
          )}
        </label>

        {selected.size > 0 && (
          confirmBulk ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{selected.size}개를 삭제할까요?</span>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isPending || deletingIds.size > 0}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {(isPending || deletingIds.size > 0) && <Loader2 className="h-3 w-3 animate-spin" />}
                삭제
              </button>
              <button
                type="button"
                onClick={() => setConfirmBulk(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmBulk(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {selected.size}개 삭제
            </button>
          )
        )}
      </div>

      {projects.map((project) => {
        const isDeleting = deletingIds.has(project.id)
        const isDuplicating = duplicatingId === project.id
        const isChecked = selected.has(project.id)
        const thumbnail = project.thumbnail_url ?? project.banner_url

        return (
          <div
            key={project.id}
            className={[
              'group flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all',
              isChecked ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
              isDeleting ? 'pointer-events-none opacity-40' : '',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleOne(project.id)}
              onClick={(event) => event.stopPropagation()}
              className="h-4 w-4 shrink-0 rounded accent-gray-900"
            />

            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt={project.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </div>

            <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-semibold text-gray-900 group-hover:text-gray-700">
                  {project.title}
                </p>
                {project.is_published ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Globe className="h-2.5 w-2.5" />
                    공개
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    <EyeOff className="h-2.5 w-2.5" />
                    비공개
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  필드 {project.fieldCount}개
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.created_at_label}
                </span>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/projects/${project.id}/execution/forms`}
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-violet-50 hover:text-violet-600"
                title="프로젝트 폼"
              >
                <SquarePen className="h-4 w-4" />
              </Link>

              <Link
                href={`/projects/${project.id}/execution/live-responses`}
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-green-50 hover:text-green-600"
                title="응답 보기"
              >
                <BarChart2 className="h-4 w-4" />
              </Link>

              <Link
                href={`/${project.slug}`}
                target="_blank"
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-blue-50 hover:text-blue-500"
                title="공개 폼 보기"
              >
                <Eye className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={() => handleDuplicate(project.id)}
                disabled={isDuplicating || deletingIds.size > 0}
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-yellow-50 hover:text-yellow-600 disabled:opacity-30"
                title="복제"
              >
                {isDuplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteOne(project.id, project.title)}
                disabled={isDeleting || deletingIds.size > 0}
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                title="삭제"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
