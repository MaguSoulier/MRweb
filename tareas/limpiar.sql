-- CUIDADO: borra TODAS las tareas, proyectos y usuarios (cada persona deberá crear su cuenta de nuevo con su apodo).
-- La lista allowed_emails NO se toca. Ejecutar solo una vez, antes de que el equipo se registre.
delete from tasks;
delete from projects;
delete from auth.users; -- también borra los perfiles (on delete cascade)
