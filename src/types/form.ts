export type FieldType = 'text' | 'email' | 'textarea' | 'checkbox'

export interface FormField {
  id: string
  label: string
  type: FieldType
  required: boolean
  order_index: number
}

export interface Project {
  id?: string
  user_id?: string
  title: string
  slug: string
  banner_url?: string | null
  created_at?: string
}
