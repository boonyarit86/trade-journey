export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface TaskItem {
  id: string
  title: string
  assignee: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
}
