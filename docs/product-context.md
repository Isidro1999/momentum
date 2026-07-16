# Momentum — Contexto del producto

## Visión

Momentum es una aplicación personal de organización, seguimiento y reflexión.

Su objetivo es ayudar al usuario a organizar las distintas áreas de su vida, registrar su actividad diaria y comprender si está avanzando hacia sus objetivos.

No debe funcionar como una aplicación que castigue al usuario por no completar tareas. Debe valorar el progreso, la planificación realista, la reflexión y la capacidad de retomar después de un día difícil.

## Usuario inicial

El usuario inicial es Isidro.

Actualmente divide su tiempo entre:

- Trabajo en Feater.
- Búsqueda de un nuevo trabajo.
- Proyecto personal IFEDEL.
- Facultad por las noches.
- Entrenamiento y salud.
- Vida personal.

## Áreas iniciales

- Feater.
- Búsqueda laboral.
- IFEDEL.
- Facultad.
- Entrenamiento.
- Personal.

## Estado del MVP (implementado)

### Módulos disponibles

| Módulo | Ruta | Estado |
|--------|------|--------|
| Hoy | `/` | Implementado |
| Tareas | `/tareas` | Implementado |
| Objetivos | `/objetivos`, `/objetivos/[id]` | Implementado |
| Bitácora | `/bitacora`, `/bitacora/[date]` | Implementado |
| Progreso | `/progreso` | Implementado |
| Auth | `/login`, `/registro`, recuperación | Implementado |
| Calendario | — | Pendiente (nav marcada “Pronto”) |
| Configuración | — | Pendiente (nav marcada “Pronto”) |

### Persistencia

**Fuente principal:** Supabase (tablas `categories`, `tasks`, `goals`, `milestones`, `daily_reviews`) con RLS por usuario.

**localStorage:** solo como respaldo temporal para detectar e importar datos previos (`momentum.tasks.v1`, `momentum.goals.v1`, `momentum.dailyReviews.v1`). Tras migrar providers, la app **no escribe** datos nuevos en localStorage.

Importación opcional (una vez por usuario, vía `profiles.local_storage_migrated_at`):

1. Si hay datos locales y la cuenta aún no migró → banner para importar u omitir.
2. Orden: categorías (ya seed) → objetivos → hitos → tareas → bitácora.
3. Idempotencia con `local_source_id` (migración SQL `002`).
4. Tras éxito: opción de eliminar la copia local (con confirmación).

### Arquitectura

- Next.js App Router + TypeScript + Tailwind CSS 4.
- Auth: Supabase Auth + `proxy.ts` (sesión SSR).
- Providers: `CategoryProvider`, `TaskProvider`, `GoalProvider`, `DailyReviewProvider`, `MigrationProvider`.
- Repositorios: `lib/repositories/*` (mapeo dominio ES ↔ DB EN).
- Hooks: `useTasks`, `useGoals`, `useDailyReviews`, `useCategories`, `useMigration`.
- Fechas locales: `lib/dates.ts`.
- Analytics de Progreso: `lib/analytics/*`.
- Layout: sidebar desktop + navegación inferior mobile (`AppShell`).

### Funcionalidades por módulo

**Hoy**

- Saludo con nombre del profile.
- Prioridad del día, tareas de hoy, progreso, objetivos activos, bienestar.
- CTA de cierre del día.
- Bloque “Próximo evento” marcado como pronto.

**Tareas / Objetivos / Bitácora / Progreso**

- CRUD completo contra Supabase.
- Misma UI y filtros que el MVP local.
- Loading / error / retry sin flashes de empty state.

## Principios de experiencia

- Clara y tranquila; desktop y mobile.
- Completar tareas debe sentirse satisfactorio.
- Postergadas no son fracasos.
- Registro diario ≤ cuatro minutos.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, Lucide, Recharts, date-fns.
- Supabase (Auth + Postgres + RLS).
- Vercel para publicación.

## Pendiente

- Calendario y eventos reales.
- Configuración de perfil.
- Notificaciones, IA, exportación.
- Offline / realtime.
- Retirar por completo el respaldo localStorage.

## Checklist de release

Ver `docs/qa-checklist.md`.
