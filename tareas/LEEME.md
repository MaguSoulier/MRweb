# Tareas del equipo (estilo Planner)

Web estática + Supabase (gratis). No hay servidor que mantener.

## Probar y mejorar el diseño sin backend

Mientras `config.js` tenga los valores de ejemplo, la app funciona en **modo demo**: abre `index.html`, escribe
cualquier correo y contraseña, y todo se guarda solo en tu navegador (`mock.js`). Para reiniciar los datos de
prueba, borra los datos del sitio en el navegador. Al poner las claves reales de Supabase se desactiva solo.

## Diseño: tokens y tipografías

- `tokens.css` contiene la paleta del Figma (primitivos) y los tokens semánticos (`--color-primary`, `--color-danger`, `--color-surface`…). En `index.html` no hay colores ni fuentes escritos a mano: usa siempre `var(--…)`.
- Las únicas tipografías son **Archivo** (`--font-sans`) y **Chivo Mono** (`--font-mono`), cargadas desde Google Fonts.

## Puesta en marcha (≈10 min)

1. Crea una cuenta gratis en https://supabase.com y pulsa **New project** (elige una contraseña de base de datos y guárdala; región cercana).
2. En el proyecto: **SQL Editor → New query**, pega el contenido de `schema.sql` y pulsa **Run**.
3. **Authentication → Sign In / Providers → Email**: desactiva **Confirm email** (así los 5 podéis entrar sin verificar correo).
4. **Project Settings → API**: copia *Project URL* y la clave *anon public* y pégalas en `config.js`.
5. Abre `index.html` (doble clic) y crea tu cuenta. Los demás hacen lo mismo.

## Publicarlo para que todos entren

Esta carpeta vive en el repositorio y GitHub Pages la publica en https://mediaresma.uy/tareas/ (no hay enlaces
hacia ella desde el resto del sitio y lleva `noindex`, así que solo se entra escribiendo la dirección).

## Ajustes de la cuenta (apodo y foto)

El engranaje de la barra lateral abre una pantalla completa con: foto de perfil, apodo, vista predeterminada
(solo en ese dispositivo) y cerrar sesión. Para que el apodo y la foto se guarden hay que ejecutar **una vez**
`perfil.sql` en Supabase (SQL Editor > New query > pegar > Run): añade la columna `avatar_url`, deja que cada
persona edite solo su propio perfil y crea el espacio `avatars` para las fotos.

## Colores de las tareas

En Ajustes > "Colores de las tareas" cada persona elige con qué criterio se colorean: **Estado** (por defecto),
**Prioridad**, **Persona**, **Proyecto** o **Personalizado** (cada tarea lleva su color, que se elige en el panel
de la tarea). Debajo se ve qué significa cada color y se puede cambiar. Si con el modo elegido todas las tareas que se
ven saldrían del mismo color (p. ej. dentro de un proyecto, coloreando por proyecto), esa vista usa Estado.
El modo y los colores de estado/prioridad son personales; los colores de personas y proyectos los ve todo el equipo.
Cada color se elige con un selector libre (rueda de color) o escribiendo su código HEX.
Hay que ejecutar **una vez** `colores.sql` en Supabase (después de `acceso.sql` y `perfil.sql`) y luego `colores_libre.sql`,
que permite guardar cualquier color.

## Seguridad

Cualquiera con el enlace puede crear una cuenta y ver las tareas. Cuando los 5 se hayan registrado, desactiva
**Authentication → Sign In / Providers → "Allow new users to sign up"**.

La clave `anon` es pública por diseño; la protección real está en las políticas del `schema.sql`.

## Qué incluye

- Barra lateral con calendario (puntos en los días con tareas), proyectos y personas.
- Al pulsar una persona o un proyecto se filtran sus tareas; volver a pulsarlo muestra todas.
- En la fila de un proyecto, un punto por cada persona asignada; en la de una persona, un punto por tarea.
  Colores: gris sin iniciar, naranja en proceso, verde completada, rojo atrasada.
- Vista en lista o tablero (arrastrar entre columnas cambia el estado) y orden por fecha, prioridad, estado, nombre o proyecto.
- Panel de detalles a la derecha: varias personas por tarea, prioridad (!!!, !! o !), fecha límite y descripción.
- Cambios en tiempo real entre todos los usuarios.
