'use client'

import { AlignLeft } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import FieldCard from './FieldCard'
import { INPUT_CLASS } from '@/constants/builder'
import type { FormField } from '@/types/database'

interface BuilderCanvasProps {
  title: string
  onTitleChange: (value: string) => void
  fields: FormField[]
  onUpdateField: (id: string, patch: Partial<FormField>) => void
  onRemoveField: (id: string) => void
  onDragEnd: (event: DragEndEvent) => void
  titlePlaceholder?: string
}

/**
 * Groups fields by section boundaries.
 * Returns an array of groups: { sectionField?: FormField, fields: FormField[] }
 * Fields before any section are in a group with no sectionField.
 */
function groupBySection(fields: FormField[]) {
  const groups: { sectionField?: FormField; fields: FormField[] }[] = []
  let current: { sectionField?: FormField; fields: FormField[] } = { fields: [] }

  for (const f of fields) {
    if (f.type === 'section') {
      // Push previous group only if it has fields (or it's the initial group)
      if (current.fields.length > 0 || current.sectionField) {
        groups.push(current)
      }
      current = { sectionField: f, fields: [] }
    } else {
      current.fields.push(f)
    }
  }
  groups.push(current)
  return groups
}

export default function BuilderCanvas({
  title,
  onTitleChange,
  fields,
  onUpdateField,
  onRemoveField,
  onDragEnd,
  titlePlaceholder = '예: 2024 고객 만족도 설문',
}: BuilderCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const groups = groupBySection(fields)
  const hasSections = fields.some((f) => f.type === 'section')

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <section className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              프로젝트 제목 <span className="text-red-400">*</span>
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titlePlaceholder}
              className={INPUT_CLASS}
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            폼 필드{' '}
            <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 font-normal text-gray-600">
              {fields.length}
            </span>
          </p>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
              <AlignLeft className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">아직 필드가 없어요</p>
              <p className="mt-1 text-xs text-gray-400">왼쪽 사이드바에서 필드 유형을 클릭하세요.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {hasSections ? (
                  // ── 섹션 그룹 뷰 ──────────────────────────────────────────
                  <div className="space-y-4">
                    {groups.map((group, gi) => (
                      <div key={group.sectionField?.id ?? `pre-${gi}`}>
                        {/* 섹션 헤더 카드 */}
                        {group.sectionField && (
                          <FieldCard
                            field={group.sectionField}
                            allFields={fields}
                            onUpdate={(patch) => onUpdateField(group.sectionField!.id, patch)}
                            onRemove={() => onRemoveField(group.sectionField!.id)}
                          />
                        )}
                        {/* 섹션에 속한 필드들 — 들여쓰기 + 왼쪽 보더 */}
                        {group.fields.length > 0 && (
                          <div className={[
                            'space-y-2',
                            group.sectionField ? 'ml-4 border-l-2 border-slate-200 pl-4' : '',
                          ].join(' ')}>
                            {group.fields.map((field) => (
                              <FieldCard
                                key={field.id}
                                field={field}
                                allFields={fields}
                                onUpdate={(patch) => onUpdateField(field.id, patch)}
                                onRemove={() => onRemoveField(field.id)}
                              />
                            ))}
                          </div>
                        )}
                        {/* 빈 섹션 안내 */}
                        {group.sectionField && group.fields.length === 0 && (
                          <div className="ml-4 border-l-2 border-dashed border-slate-200 pl-4 py-3">
                            <p className="text-xs text-gray-400">이 섹션에 필드를 드래그해 넣으세요.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // ── 단순 flat 뷰 (섹션 없을 때) ──────────────────────────
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        allFields={fields}
                        onUpdate={(patch) => onUpdateField(field.id, patch)}
                        onRemove={() => onRemoveField(field.id)}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>
    </main>
  )
}
