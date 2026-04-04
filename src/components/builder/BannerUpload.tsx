'use client'

// 02-FORM-BUILDER-UI.md: 상단 배너 이미지 업로드 및 미리보기 영역

import { useRef } from 'react'
import Image from 'next/image'
import { ImageIcon, X, RefreshCw } from 'lucide-react'

interface BannerUploadProps {
  preview: string | null
  onFileChange: (file: File) => void
  onRemove: () => void
}

export default function BannerUpload({ preview, onFileChange, onRemove }: BannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileChange(file)
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        배너 이미지
      </p>

      <div
        onClick={() => !preview && inputRef.current?.click()}
        className={[
          'relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
          preview
            ? 'border-transparent'
            : 'cursor-pointer border-gray-200 bg-white hover:border-gray-400',
        ].join(' ')}
        style={{ height: preview ? 'auto' : '160px' }}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="배너 미리보기"
              width={1600}
              height={900}
              unoptimized
              className="w-full rounded-2xl object-cover"
              style={{ maxHeight: '200px' }}
            />

            {/* 이미지 변경 */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-3 right-12 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black/70"
            >
              <RefreshCw className="h-3 w-3" />
              변경
            </button>

            {/* 이미지 제거 */}
            <button
              type="button"
              onClick={onRemove}
              className="absolute bottom-3 right-3 rounded-lg bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full select-none flex-col items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">클릭하여 배너 이미지 업로드</p>
            <p className="text-xs text-gray-400">PNG · JPG · WEBP</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
