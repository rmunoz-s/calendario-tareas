-- Si la tabla ya existe, ejecuta solo esto en SQL Editor → Run

alter table tasks
  add column if not exists description text not null default '';
