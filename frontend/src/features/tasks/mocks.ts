import type { TaskItem } from './types.ts'

export const tasksMock: TaskItem[] = [
  { id: 't_01', title: 'Set up auth mocks', assignee: 'Jane', status: 'done', priority: 'high' },
  {
    id: 't_02',
    title: 'Create dashboard cards',
    assignee: 'Mina',
    status: 'in_progress',
    priority: 'medium',
  },
  {
    id: 't_03',
    title: 'Document folder conventions',
    assignee: 'Boon',
    status: 'todo',
    priority: 'high',
  },
]
