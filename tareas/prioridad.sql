-- Ejecutar en Supabase > SQL Editor: las prioridades pasan de 4 niveles (P1-P4) a 3 (!!!, !!, !)
update tasks set priority = 3 where priority = 4;
alter table tasks drop constraint if exists tasks_priority_check;
alter table tasks add constraint tasks_priority_check check (priority between 1 and 3);
