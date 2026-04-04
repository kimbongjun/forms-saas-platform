'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface DeleteFormButtonProps {
  formId: string
  title: string
  responseCount: number
}

export default function DeleteFormButton({ formId, title, responseCount }: DeleteFormButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const warningMessage =
      responseCount > 0
        ? `'${title}' 폼을 삭제하시겠습니까?\n\n현재 ${responseCount}개의 응답이 연결되어 있습니다.\n폼과 응답 데이터가 함께 삭제될 수 있으며, 이 작업은 되돌릴 수 없습니다.`
        : `'${title}' 폼을 삭제하시겠습니까?\n\n연결 데이터가 함께 삭제될 수 있으며, 이 작업은 되돌릴 수 없습니다.`

    if (!window.confirm(warningMessage)) {
      return
    }

    const supabase = createClient()
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('projects').delete().eq('id', formId)
      if (error) throw error
      startTransition(() => router.refresh())
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting || isPending}
      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting || isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      삭제
    </button>
  )
}
