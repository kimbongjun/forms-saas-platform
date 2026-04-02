'use client'

import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  height?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToastEditorInstance = any

export default function RichTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = '300px',
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ToastEditorInstance>(null)
  const initedRef = useRef(false)

  useEffect(() => {
    if (initedRef.current || !containerRef.current) return
    initedRef.current = true

    async function init() {
      if (!containerRef.current) return

      // Dynamic import to avoid SSR issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const EditorModule = await import('@toast-ui/editor' as any)
      await import('@toast-ui/editor/dist/toastui-editor.css' as any)

      const EditorClass = EditorModule.default ?? EditorModule.Editor

      editorRef.current = new EditorClass({
        el: containerRef.current,
        initialValue: content || '',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        height,
        placeholder,
        hideModeSwitch: false,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol'],
          ['table', 'link'],
          ['code', 'codeblock'],
        ],
        events: {
          change: () => {
            const html: string = editorRef.current.getHTML()
            onChange(html === '<p><br></p>' ? '' : html)
          },
        },
      })
    }

    init()

    return () => {
      if (editorRef.current) {
        try { editorRef.current.destroy() } catch { /* ignore */ }
        editorRef.current = null
        initedRef.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external content changes (e.g. initial data load)
  const prevContentRef = useRef(content)
  useEffect(() => {
    if (!editorRef.current || prevContentRef.current === content) return
    prevContentRef.current = content
    try {
      const current: string = editorRef.current.getHTML()
      if (current !== content) {
        editorRef.current.setHTML(content || '')
      }
    } catch { /* ignore */ }
  }, [content])

  return <div ref={containerRef} />
}
