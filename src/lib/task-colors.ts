import type { TaskType } from "./types";

export const TASK_TYPES: {
  id: TaskType;
  label: string;
  color: string;
  soft: string;
}[] = [
  { id: "examen", label: "Exámenes", color: "#F07178", soft: "#FDE8EA" },
  { id: "tarea", label: "Excursiones", color: "#7BC47F", soft: "#E8F6E9" },
  { id: "trabajo", label: "Trabajos", color: "#6BA3D9", soft: "#E5F0FA" },
  { id: "otra", label: "Otras", color: "#B48AD9", soft: "#F3EAF9" },
];

export function getTypeMeta(type: TaskType) {
  return TASK_TYPES.find((t) => t.id === type) ?? TASK_TYPES[3];
}
