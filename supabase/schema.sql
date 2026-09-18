-- Ejecuta esto en Supabase: SQL Editor → New query → Run

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  description text not null default '',
  due_date date not null,
  type text not null check (type in ('examen', 'tarea', 'trabajo', 'otra')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_due_date_idx on tasks (due_date);

alter table tasks enable row level security;

create policy "Permitir leer tareas"
  on tasks for select
  using (true);

create policy "Permitir crear tareas"
  on tasks for insert
  with check (true);

create policy "Permitir editar tareas"
  on tasks for update
  using (true);

create policy "Permitir borrar tareas"
  on tasks for delete
  using (true);
