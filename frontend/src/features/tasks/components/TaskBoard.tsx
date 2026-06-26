import type { TaskItem, TaskStatus } from '../types.ts'
import { Card } from '../../../shared/ui/Card.tsx'

interface TaskBoardProps {
  tasks: TaskItem[]
}

const columns: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
]

function byStatus(tasks: TaskItem[], status: TaskStatus) {
  return tasks.filter((task) => task.status === status)
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="task-board">
      {columns.map((column) => (
        <Card key={column.key} title={column.label}>
          <ul className="task-list">
            {byStatus(tasks, column.key).map((task) => (
              <li key={task.id} className="task-item">
                <p className="task-title">{task.title}</p>
                <p className="subtle">
                  {task.assignee} - <span className={`priority-${task.priority}`}>{task.priority}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}
