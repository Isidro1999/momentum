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
| Calendario | — | Pendiente (nav marcada “Pronto”) |
| Configuración | — | Pendiente (nav marcada “Pronto”) |

### Persistencia local

Sin backend. Los datos viven en `localStorage` con claves versionadas:

| Clave | Contenido |
|-------|-----------|
| `momentum.tasks.v1` | Tareas |
| `momentum.goals.v1` | Objetivos + hitos |
| `momentum.dailyReviews.v1` | Cierres / bitácora diaria |

Comportamiento de carga:

- `missing`: se insertan seeds (tareas y objetivos) una sola vez; bitácora inicia vacía.
- `ok`: se cargan los datos válidos.
- `corrupt`: no se sobrescribe; UI muestra banner de recuperación; `canPersist` queda en false hasta recuperar.
- `JSON.parse` fallido → fallback seguro (`corrupt`), sin romper la app.

### Arquitectura

- Next.js App Router + TypeScript + Tailwind CSS 4.
- Providers en cliente: `TaskProvider`, `GoalProvider`, `DailyReviewProvider`.
- Hooks: `useTasks`, `useGoals`, `useDailyReviews`.
- Capa de storage: `lib/*-storage.ts` + `lib/storage.ts` (`safeJsonParse`, `safeLocalStorageSet`).
- Fechas locales: `lib/dates.ts` (`getTodayDateString`, `isValidDateString`, `isoToLocalDateString`, saludo por hora).
- Analytics de Progreso: `lib/analytics/*` (lectura; no inventa métricas sin datos).
- Layout: sidebar desktop + navegación inferior mobile (`AppShell`).
- Modales globales de tarea, objetivo y cierre diario.

### Funcionalidades por módulo

**Hoy**

- Saludo por hora, fecha local en español.
- Prioridad del día derivada de tareas pendientes (fallback al cierre / mensaje genérico).
- Lista de tareas de hoy con completar/editar.
- Progreso diario, objetivos activos destacados, bienestar desde el cierre.
- CTA de cierre del día.
- Bloque “Próximo evento” marcado como pronto (Calendario aún no existe).

**Tareas**

- CRUD, estados (pendiente, en progreso, completada, postergada, cancelada).
- Buscar, filtrar por alcance/estado/categoría/prioridad/objetivo.
- Persistencia y reflejo en Hoy / Objetivos / Progreso.

**Objetivos**

- CRUD, pausar/reactivar, completar, cancelar, eliminar (con confirmación).
- Hitos: crear, editar, completar, eliminar, reordenar.
- Progreso por modo (manual / hitos / tareas).
- Relación con tareas.

**Bitácora**

- Registrar/editar por fecha (sin fechas futuras ni duplicados por día).
- Listado con búsqueda y períodos; detalle por fecha.
- Escalas 1–10 + reflexión + flags de actividades.

**Progreso**

- Períodos: 7d, 30d, 3m, mes.
- Métricas, gráficos Recharts, insights solo con datos reales.
- Estados vacíos cuando no hay suficiente información.

## Principios de experiencia

- La aplicación debe ser clara y tranquila.
- Debe evitar la sobrecarga visual.
- Debe funcionar correctamente en desktop y mobile.
- Completar tareas debe sentirse satisfactorio.
- Las tareas postergadas no deben mostrarse como fracasos.
- Los gráficos deben ayudar a comprender patrones.
- El registro diario no debería tomar más de cuatro minutos.

## Stack

- Next.js (App Router).
- TypeScript.
- Tailwind CSS.
- Lucide Icons.
- Recharts.
- date-fns.
- Supabase en una etapa posterior.
- Vercel para publicación.

## Pendiente (fuera del MVP actual)

- Calendario y próximos eventos reales.
- Supabase / sync / multi-dispositivo.
- Login y cuentas.
- Notificaciones.
- Inteligencia artificial.
- Exportación de datos.
- Configuración de perfil y preferencias.
- Nuevos módulos o gráficos adicionales.

## Checklist de release

Ver `docs/qa-checklist.md` para la validación manual antes de cada release.
