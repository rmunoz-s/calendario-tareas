export type TaskType = "examen" | "tarea" | "trabajo" | "otra";

export type Task = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  due_date: string;
  type: TaskType;
  created_at: string;
  updated_at: string;
};

export type TaskInput = {
  title: string;
  subject: string;
  description: string;
  due_date: string;
  type: TaskType;
};

export type CalendarView = "year" | "month" | "week";
