"use client";

import { TASK_TYPES } from "@/lib/task-colors";

export function CalendarLegend() {
  return (
    <ul className="legend">
      {TASK_TYPES.map((t) => (
        <li key={t.id}>
          <span className="legend-dot" style={{ background: t.color }} />
          {t.label}
        </li>
      ))}
    </ul>
  );
}
