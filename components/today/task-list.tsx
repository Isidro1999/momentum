import Link from "next/link";
import type { Task } from "@/types";
import { TaskItem } from "@/components/today/task-item";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function TaskList({ tasks, isLoading = false }: TaskListProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            Tareas de hoy
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {isLoading ? "Cargando…" : `${tasks.length} en total`}
          </p>
        </div>
        <Link
          href="/tareas"
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Ver todas
        </Link>
      </div>

      {isLoading ? (
        <p className="px-2 py-6 text-sm text-slate-500 sm:px-3">
          Cargando tareas…
        </p>
      ) : tasks.length === 0 ? (
        <p className="px-2 py-6 text-sm text-slate-500 sm:px-3">
          No hay tareas para hoy. Creá una nueva para organizar tu jornada.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
