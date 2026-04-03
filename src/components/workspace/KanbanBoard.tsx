'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { createClient } from '@/utils/supabase/client'
import { Calendar, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react'

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface Task {
  id: string
  project_id: string
  title: string
  assignee: string | null
  due_date: string | null
  status: ColumnId
  order_index: number
}

type ColumnId = 'todo' | 'in_progress' | 'done' | 'hold'

// ── 컬럼 정의 ─────────────────────────────────────────────────────────────────

const COLUMNS: { id: ColumnId; label: string; bg: string; badge: string }[] = [
  { id: 'todo',        label: '예정',    bg: 'bg-gray-50',    badge: 'bg-gray-200 text-gray-600' },
  { id: 'in_progress', label: '진행 중', bg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700' },
  { id: 'done',        label: '완료',    bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'hold',        label: '보류',    bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700' },
]

// ── DraggableCard ─────────────────────────────────────────────────────────────

function DraggableCard({
  task,
  onDelete,
}: {
  task: Task
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-xl border bg-white p-3 shadow-sm transition-shadow select-none',
        isDragging ? 'opacity-40 shadow-lg' : 'hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-gray-900">{task.title}</p>
          {task.assignee && (
            <p className="mt-1 text-xs text-gray-400">{task.assignee}</p>
          )}
          {task.due_date && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {task.due_date}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded p-1 text-gray-200 transition-colors hover:bg-red-50 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── DroppableColumn ───────────────────────────────────────────────────────────

function DroppableColumn({
  column,
  tasks,
  onAdd,
  onDelete,
}: {
  column: (typeof COLUMNS)[number]
  tasks: Task[]
  onAdd: (columnId: ColumnId, title: string) => Promise<void>
  onDelete: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const [adding, setAdding] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  async function handleAdd() {
    const title = inputValue.trim()
    if (!title) { setAdding(false); return }
    setSaving(true)
    await onAdd(column.id, title)
    setInputValue('')
    setSaving(false)
    setAdding(false)
  }

  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${column.badge}`}>
            {column.label}
          </span>
          <span className="text-xs font-medium text-gray-400">{tasks.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="태스크 추가"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* 카드 영역 */}
      <div
        ref={setNodeRef}
        className={[
          'flex flex-1 flex-col gap-2 overflow-y-auto p-3 transition-colors',
          isOver ? column.bg : '',
        ].join(' ')}
        style={{ minHeight: 80 }}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} onDelete={onDelete} />
        ))}

        {/* 인라인 추가 폼 */}
        {adding && (
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') { setAdding(false); setInputValue('') }
              }}
              placeholder="태스크 제목..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                추가
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setInputValue('') }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── KanbanBoard ───────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  projectId: string
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // 초기 로드
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (err) {
        setError(err.message)
      } else {
        setTasks(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [projectId])

  // 태스크 추가
  async function handleAdd(columnId: ColumnId, title: string) {
    const supabase = createClient()
    const maxIndex = tasks.filter((t) => t.status === columnId).length
    const { data, error: err } = await supabase
      .from('project_tasks')
      .insert({ project_id: projectId, title, status: columnId, order_index: maxIndex })
      .select()
      .single()

    if (err) { setError(err.message); return }
    setTasks((prev) => [...prev, data])
  }

  // 태스크 삭제
  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('project_tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  // DnD 드래그 시작
  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  // DnD 드래그 종료
  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const draggedTask = tasks.find((t) => t.id === active.id)
    if (!draggedTask) return

    const newStatus = over.id as ColumnId
    if (!COLUMNS.find((c) => c.id === newStatus)) return
    if (draggedTask.status === newStatus) return

    // 낙관적 업데이트
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask.id ? { ...t, status: newStatus } : t))
    )

    const supabase = createClient()
    const { error: err } = await supabase
      .from('project_tasks')
      .update({ status: newStatus })
      .eq('id', draggedTask.id)

    if (err) {
      // 실패 시 롤백
      setTasks((prev) =>
        prev.map((t) => (t.id === draggedTask.id ? { ...t, status: draggedTask.status } : t))
      )
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.status === col.id)}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-2xl opacity-95">
              <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
