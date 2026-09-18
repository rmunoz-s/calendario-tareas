"use client";

import { addDays, format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Task } from "@/lib/types";
import { getTypeMeta } from "@/lib/task-colors";

type Props = {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
};

export function UpcomingTasks({ tasks, onSelectTask }: Props) {
  const today = startOfDay(new Date());
  const until = addDays(today, 9);

  const upcoming = tasks
    .filter((t) => {
      const d = startOfDay(parseISO(t.due_date));
      return isWithinInterval(d, { start: today, end: until });
    })
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <section className="upcoming">
      <div className="section-head">
        <h2>Próximos 10 días</h2>
        <p>Entregas y exámenes que llegan pronto, en orden.</p>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          <p>No hay nada en los próximos 10 días. Respira ✨</p>
        </div>
      ) : (
        <ul className="upcoming-list">
          {upcoming.map((task) => {
            const meta = getTypeMeta(task.type);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  className="upcoming-item"
                  onClick={() => onSelectTask(task)}
                >
                  <span
                    className="upcoming-date"
                    style={{ background: meta.soft, color: meta.color }}
                  >
                    <strong>{format(parseISO(task.due_date), "d")}</strong>
                    <em>{format(parseISO(task.due_date), "MMM", { locale: es })}</em>
                  </span>
                  <span className="upcoming-body">
                    <strong>{task.title}</strong>
                    <em>{task.subject}</em>
                    {task.description?.trim() && (
                      <span className="upcoming-desc">{task.description}</span>
                    )}
                    <span className="tag" style={{ background: meta.soft, color: "#5c4d5c" }}>
                      <i style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
