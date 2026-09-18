"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Task, TaskInput, TaskType } from "@/lib/types";
import { TASK_TYPES } from "@/lib/task-colors";

type Props = {
  open: boolean;
  initial?: Task | null;
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const empty: TaskInput = {
  title: "",
  subject: "",
  description: "",
  due_date: "",
  type: "tarea",
};

export function TaskModal({
  open,
  initial,
  defaultDate,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [form, setForm] = useState<TaskInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setForm({
        title: initial.title,
        subject: initial.subject,
        description: initial.description ?? "",
        due_date: initial.due_date,
        type: initial.type,
      });
    } else {
      setForm({
        ...empty,
        due_date: defaultDate ?? new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, initial, defaultDate]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim() || !form.due_date) {
      setError("Rellena título, asignatura y fecha.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const ok = window.confirm("¿Borrar esta entrega?");
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="task-modal-title">
            {initial ? "Editar entrega" : "Nueva entrega"}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Título
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Lámina de acuarela"
              required
            />
          </label>

          <label>
            Asignatura
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Ej. Ilustración I"
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Enunciado, enlace Drive, guía, notas…"
              rows={4}
            />
          </label>

          <label>
            Fecha
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              required
            />
          </label>

          <fieldset className="type-fieldset">
            <legend>Tipo</legend>
            <div className="type-grid">
              {TASK_TYPES.map((t) => (
                <label key={t.id} className={`type-option ${form.type === t.id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="type"
                    value={t.id}
                    checked={form.type === t.id}
                    onChange={() => setForm((f) => ({ ...f, type: t.id as TaskType }))}
                  />
                  <span className="dot" style={{ background: t.color }} />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            {initial && onDelete && (
              <button
                type="button"
                className="btn danger"
                onClick={handleDelete}
                disabled={saving}
              >
                Borrar
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? "Guardando…" : initial ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
