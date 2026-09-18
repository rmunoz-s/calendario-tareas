"use client";

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarView, Task } from "@/lib/types";
import { getTypeMeta } from "@/lib/task-colors";

type Props = {
  view: CalendarView;
  cursor: Date;
  tasks: Task[];
  onSelectDay: (date: Date) => void;
  onSelectTask: (task: Task) => void;
};

function tasksOnDay(tasks: Task[], day: Date) {
  return tasks.filter((t) => isSameDay(parseISO(t.due_date), day));
}

export function CalendarGrid({
  view,
  cursor,
  tasks,
  onSelectDay,
  onSelectTask,
}: Props) {
  if (view === "year") {
    return (
      <div className="year-grid">
        {Array.from({ length: 12 }, (_, month) => {
          const monthDate = new Date(cursor.getFullYear(), month, 1);
          const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
          const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
          const days = eachDayOfInterval({ start, end });

          return (
            <div key={month} className="year-month">
              <h3>{format(monthDate, "MMMM", { locale: es })}</h3>
              <div className="year-weekdays">
                {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="year-days">
                {days.map((day) => {
                  const dayTasks = tasksOnDay(tasks, day);
                  const inMonth = isSameMonth(day, monthDate);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      className={`year-day ${inMonth ? "" : "muted"} ${isToday(day) ? "today" : ""}`}
                      onClick={() => onSelectDay(day)}
                      title={format(day, "d MMM", { locale: es })}
                    >
                      <span className="num">{format(day, "d")}</span>
                      <span className="dots">
                        {dayTasks.slice(0, 3).map((t) => (
                          <i
                            key={t.id}
                            style={{ background: getTypeMeta(t.type).color }}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (view === "week") {
    const start = startOfWeek(cursor, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
      <div className="week-grid">
        {days.map((day) => {
          const dayTasks = tasksOnDay(tasks, day);
          return (
            <div key={day.toISOString()} className={`week-col ${isToday(day) ? "today" : ""}`}>
              <button type="button" className="week-head" onClick={() => onSelectDay(day)}>
                <span className="weekday">{format(day, "EEE", { locale: es })}</span>
                <span className="daynum">{format(day, "d")}</span>
              </button>
              <div className="week-tasks">
                {dayTasks.length === 0 && (
                  <p className="empty-soft">Sin entregas</p>
                )}
                {dayTasks.map((task) => {
                  const meta = getTypeMeta(task.type);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      className="task-chip"
                      style={{
                        background: meta.soft,
                        borderColor: meta.color,
                      }}
                      onClick={() => onSelectTask(task)}
                    >
                      <span className="chip-dot" style={{ background: meta.color }} />
                      <span className="chip-text">
                        <strong>{task.title}</strong>
                        <em>{task.subject}</em>
                        {task.description?.trim() && (
                          <span className="chip-desc">{task.description}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // month
  const monthStart = startOfMonth(cursor);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="month-wrap">
      <div className="month-weekdays">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const dayTasks = tasksOnDay(tasks, day);
          const inMonth = isSameMonth(day, cursor);
          return (
            <div
              key={day.toISOString()}
              className={`month-cell ${inMonth ? "" : "muted"} ${isToday(day) ? "today" : ""}`}
            >
              <button type="button" className="month-daynum" onClick={() => onSelectDay(day)}>
                {format(day, "d")}
              </button>
              <div className="month-tasks">
                {dayTasks.slice(0, 3).map((task) => {
                  const meta = getTypeMeta(task.type);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      className="task-pill"
                      style={{ background: meta.soft, color: "#4a3f4a" }}
                      onClick={() => onSelectTask(task)}
                    >
                      <i style={{ background: meta.color }} />
                      <span>{task.title}</span>
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <button
                    type="button"
                    className="more-link"
                    onClick={() => onSelectDay(day)}
                  >
                    +{dayTasks.length - 3} más
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
