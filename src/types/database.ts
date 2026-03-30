export type FieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'checkbox_group'
  | 'html'

export interface FormField {
  id: string
  project_id?: string
  label: string
  type: FieldType
  required: boolean
  order_index: number
  options?: string[]   // select / radio / checkbox_group 의 선택지
  content?: string     // html 타입의 WYSIWYG HTML 내용
}

export interface Project {
  id?: string
  user_id?: string
  title: string
  slug: string
  banner_url?: string | null
  notification_email?: string | null
  created_at?: string
}

export interface Submission {
  id?: string
  project_id: string
  answers: Record<string, string | boolean | string[]>
  created_at?: string
}
