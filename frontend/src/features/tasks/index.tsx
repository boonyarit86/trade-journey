import { TaskBoard } from './components/TaskBoard.tsx'
import { tasksMock } from './mocks.ts'

export function TasksPanel() {
  return (
    <section className="stack-md">
      <h2>Tasks Feature</h2>
      <p className="subtle">
        This is another standalone module under <code>features/tasks</code>.
      </p>
      <TaskBoard tasks={tasksMock} />
    </section>
  )
}
