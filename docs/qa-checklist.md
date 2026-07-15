# Checklist QA — Momentum MVP

Validación manual breve antes de cada release. Probar en desktop (~1440px) y mobile (~390px).

## Build

- [ ] `npx next build --webpack` termina sin errores.
- [ ] No se usa Turbopack para el build de release.

## Rutas

- [ ] `/` Hoy
- [ ] `/tareas`
- [ ] `/objetivos` y `/objetivos/[id]`
- [ ] `/bitacora` y `/bitacora/[date]`
- [ ] `/progreso`
- [ ] Calendario y Configuración se ven como “Pronto” (no rompen navegación).

## Tareas

- [ ] Crear, editar, eliminar (con confirmación).
- [ ] Completar y volver a pendiente.
- [ ] En progreso, postergar, cancelar / reactivar.
- [ ] Buscar y filtrar; empty state distinto si no hay datos vs sin resultados.
- [ ] Asignar objetivo y verlo en detalle del objetivo.
- [ ] Reflejo en Hoy y persistencia al recargar.

## Objetivos

- [ ] Crear, editar, pausar/reactivar, completar, cancelar, eliminar.
- [ ] Hitos: crear, editar, completar, reordenar, eliminar.
- [ ] Progreso coherente con el modo elegido.
- [ ] Reflejo en Hoy y Progreso.

## Bitácora

- [ ] Registrar hoy; editar el registro de hoy.
- [ ] Registrar un día anterior; rechazo de fechas futuras.
- [ ] Un solo registro por fecha (upsert).
- [ ] Buscar / filtrar; detalle; eliminar.
- [ ] URL con fecha inválida muestra mensaje claro.
- [ ] Reflejo en Hoy (bienestar) y Progreso.

## Progreso

- [ ] Cambiar período actualiza métricas.
- [ ] Sin datos: mensajes vacíos, sin NaN / `%` inválidos / inventados.
- [ ] Gráficos legibles en desktop y mobile.
- [ ] Insights coherentes con datos reales.

## Fechas y localStorage

- [ ] Fechas en zona local (sin desfase UTC visible).
- [ ] Formatos visibles en español donde aplica.
- [ ] Recarga: sin hydration mismatch en consola.
- [ ] Seeds solo si la clave estaba ausente.
- [ ] Datos corruptos: banner de recuperación; no pisan otras claves.

## UI / a11y / responsive

- [ ] Sin scroll horizontal accidental.
- [ ] Contenido no tapado por la nav inferior (mobile).
- [ ] Modales: Escape cierra; título accesible; labels en inputs.
- [ ] Botones solo-icono con `aria-label`.
- [ ] Focus visible en botones e inputs.
- [ ] Confirmar acciones destructivas.

## Consistencia rápida

- [ ] Alturas de botones primarios alineadas.
- [ ] Badges de estado/prioridad/categoría coherentes entre vistas.
- [ ] Cards con espaciado uniforme; ancho máximo del contenido estable.
