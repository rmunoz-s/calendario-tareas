"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  addYears,
  format,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarGrid } from "@/components/CalendarGrid";
import { CalendarLegend } from "@/components/CalendarLegend";
import { TaskModal } from "@/components/TaskModal";
import { UpcomingTasks } from "@/components/UpcomingTasks";
import {
  createTask,
  deleteTask,
  fetchTasks,
  isSupabaseConfigured,
  updateTask,
} from "@/lib/supabase";
import type { CalendarView, Task, TaskInput } from "@/lib/types";

export function HomeClient() {
  const configured = useMemo(() => isSupabaseConfigured(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tareas.");
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate(date?: Date) {
    setEditing(null);
    setDefaultDate(date ? format(date, "yyyy-MM-dd") : undefined);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDefaultDate(undefined);
    setModalOpen(true);
  }

  async function handleSubmit(input: TaskInput) {
    if (editing) {
      const updated = await updateTask(editing.id, input);
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)).sort((a, b) =>
          a.due_date.localeCompare(b.due_date),
        ),
      );
    } else {
      const created = await createTask(input);
      setTasks((prev) =>
        [...prev, created].sort((a, b) => a.due_date.localeCompare(b.due_date)),
      );
    }
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteTask(editing.id);
    setTasks((prev) => prev.filter((t) => t.id !== editing.id));
  }

  function goPrev() {
    setCursor((d) => {
      if (view === "year") return subYears(d, 1);
      if (view === "week") return subWeeks(d, 1);
      return subMonths(d, 1);
    });
  }

  function goNext() {
    setCursor((d) => {
      if (view === "year") return addYears(d, 1);
      if (view === "week") return addWeeks(d, 1);
      return addMonths(d, 1);
    });
  }

  function goToday() {
    setCursor(new Date());
  }

  const title =
    view === "year"
      ? format(cursor, "yyyy")
      : view === "week"
        ? `Semana del ${format(cursor, "d MMM", { locale: es })}`
        : format(cursor, "MMMM yyyy", { locale: es });

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Grado de ilustración</p>
          <h1>Calendario de entregas</h1>
        </div>
        <button type="button" className="btn primary big" onClick={() => openCreate()}>
          + Nueva entrega
        </button>
      </header>

      {!configured && (
        <div className="banner warn">
          Falta configurar Supabase. Crea el archivo <code>.env.local</code> con
          tu URL y anon key (te guío en el siguiente paso).
        </div>
      )}

      {error && <div className="banner error">{error}</div>}

      <section className="calendar-section">
        <div className="section-head row">
          <div>
            <h2>Calendario</h2>
            <CalendarLegend />
          </div>
          <div className="calendar-controls">
            <div className="view-tabs" role="tablist">
              {(
                [
                  ["week", "Semana"],
                  ["month", "Mes"],
                  ["year", "Año"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={view === id}
                  className={view === id ? "active" : ""}
                  onClick={() => setView(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="nav-row">
              <button type="button" className="icon-btn soft" onClick={goPrev} aria-label="Anterior">
                ‹
              </button>
              <button type="button" className="btn ghost tiny" onClick={goToday}>
                Hoy
              </button>
              <button type="button" className="icon-btn soft" onClick={goNext} aria-label="Siguiente">
                ›
              </button>
            </div>
            <p className="period-label">{title}</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Cargando entregas…</div>
        ) : (
          <CalendarGrid
            view={view}
            cursor={cursor}
            tasks={tasks}
            onSelectDay={openCreate}
            onSelectTask={openEdit}
          />
        )}
      </section>

      <UpcomingTasks tasks={tasks} onSelectTask={openEdit} />

      <TaskModal
        open={modalOpen}
        initial={editing}
        defaultDate={defaultDate}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
