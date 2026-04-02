'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { Bold, Italic, Underline, Link as LinkIcon, Palette, X } from 'lucide-react'
import { useState } from 'react'

interface LabelEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function LabelEditor({ value, onChange, placeholder = '필드 레이블' }: LabelEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const PRESET_TEXT_COLORS = [
    '#111827', '#DC2626', '#D97706', '#16A34A',
    '#2563EB', '#9333EA', '#EC4899', '#6B7280',
  ]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyle,
      Color,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[28px] text-sm text-gray-900',
        'data-placeholder': placeholder,
      },
    },
  })

  if (!editor) return null

  function applyLink() {
    if (!linkUrl.trim()) return
    editor!.chain().focus().setLink({ href: linkUrl.trim() }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  return (
    <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 focus-within:border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-900 overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-0.5 border-b border-gray-100 bg-white px-2 py-1">
        <ToolBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="굵게"
        >
          <Bold className="h-3 w-3" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="기울임"
        >
          <Italic className="h-3 w-3" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="밑줄"
        >
          <Underline className="h-3 w-3" />
        </ToolBtn>

        {/* 색상 */}
        <div className="relative">
          <ToolBtn
            active={showColorPicker}
            onClick={() => { setShowColorPicker((v) => !v); setShowLinkInput(false) }}
            title="글자 색상"
          >
            <Palette className="h-3 w-3" />
          </ToolBtn>
          {showColorPicker && (
            <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              {PRESET_TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }}
                  className="h-4 w-4 rounded-full border border-white shadow"
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false) }}
                className="h-4 w-4 rounded-full border border-gray-200 bg-white text-gray-400 flex items-center justify-center"
                title="색상 제거"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* 링크 */}
        <div className="relative">
          <ToolBtn
            active={editor.isActive('link') || showLinkInput}
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run()
              } else {
                setShowLinkInput((v) => !v)
                setShowColorPicker(false)
              }
            }}
            title="링크"
          >
            <LinkIcon className="h-3 w-3" />
          </ToolBtn>
          {showLinkInput && (
            <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                placeholder="https://..."
                className="w-44 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                autoFocus
              />
              <button
                type="button"
                onClick={applyLink}
                className="rounded bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-700"
              >
                적용
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 에디터 */}
      <div className="px-3 py-1.5" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolBtn({ children, active, onClick, title }: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        'rounded p-1 transition-colors',
        active ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
