# Setup de Supabase (base inicial + autenticación)

Esta guía configura el esquema y la autenticación de Momentum en Supabase, y la migración de datos desde `localStorage`.

**Fuente de verdad actual:** Supabase. localStorage solo se usa para detectar/importar datos previos.

## Requisitos previos

En `.env.local` (copiá desde `.env.local.example` si hace falta):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Usá la URL del proyecto y la **publishable / anon key** del dashboard. **No** uses la service role key en este repo.

## 1. Abrir el SQL Editor

1. Entrá a [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Abrí el proyecto de Momentum.
3. En el menú lateral: **SQL Editor**.
4. Creá una query nueva (**New query**).

## 2. Ejecutar el esquema inicial

1. Abrí el archivo del repo: `supabase/migrations/001_initial_schema.sql`.
2. Copiá todo el contenido.
3. Pegalo en el SQL Editor.
4. Ejecutá (**Run**).
5. Confirmá que no haya errores en el resultado.

Si ya ejecutaste el script una vez, volver a correrlo puede fallar por objetos existentes. En ese caso no lo re-ejecutes a ciegas: revisá qué tablas/policies ya existen.

## 3. Verificar que las tablas existen

En el dashboard:

1. Andá a **Table Editor** (o **Database → Tables**).
2. Deberías ver en el schema `public`:
   - `profiles`
   - `categories`
   - `goals`
   - `milestones`
   - `tasks`
   - `daily_reviews`

## 4. Revisar que RLS esté habilitado

1. Abrí cada tabla en **Table Editor** o usá **Database → Tables**.
2. En cada tabla, confirmá que **RLS** aparece como habilitado (Enabled).
3. Alternativa en SQL Editor:

```sql
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN (
    'profiles',
    'categories',
    'goals',
    'milestones',
    'tasks',
    'daily_reviews'
  )
ORDER BY relname;
```

Todas deben tener `rls_enabled = true`.

## 5. Comprobar las policies

1. En el dashboard: **Authentication → Policies** (o en cada tabla, pestaña Policies).
2. Deberías ver políticas separadas de `SELECT`, `INSERT`, `UPDATE` y `DELETE` por tabla.
3. Alternativa en SQL Editor:

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
```

No debe haber policies públicas para usuarios anónimos de lectura/escritura libre. La regla es `auth.uid()` (en `profiles` por `id`, en el resto por `user_id`). En `milestones`, INSERT/UPDATE también exige que el `goal_id` pertenezca al usuario.

## 6. Configurar URLs de autenticación

En el dashboard: **Authentication → URL Configuration**.

### Site URL (local)

```text
http://localhost:3000
```

### Redirect URLs

Agregá al menos:

```text
http://localhost:3000/auth/callback
http://localhost:3000/actualizar-contrasena
```

Cuando publiques en Vercel, sumá también las URLs de producción equivalentes.

Guardá los cambios.

### Confirmación por email

En **Authentication → Providers → Email**:

- Si **Confirm email** está activado, el registro pedirá confirmar el correo antes de iniciar sesión (o te mostrará el mensaje de confirmación en `/registro`).
- Si está desactivado, el registro puede dejar la sesión activa de inmediato y redirigir a `/`.

## 7. Abrir `/supabase-check`

Con el servidor local:

```bash
npm run dev
```

Abrí: [http://localhost:3000/supabase-check](http://localhost:3000/supabase-check)

Requiere sesión iniciada. La ruta **no** está en el sidebar ni en la navegación mobile.

## 8. Interpretar cada estado de `/supabase-check`

| Mensaje | Significado |
|---------|-------------|
| **Supabase conectado** | Variables OK y la consulta a `profiles` respondió (aunque el resultado esté vacío por RLS sin fila propia). |
| **Supabase no configurado** | Faltan `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. |
| **Conexión disponible, esquema pendiente** | El cliente llega a Supabase, pero la tabla `profiles` aún no existe (falta ejecutar el SQL). |
| **No se pudo verificar la conexión con Supabase** | Error genérico (URL/key inválidos, red, proyecto pausado, etc.). No se muestran detalles sensibles. |

## 9. Probar registro

1. Abrí [http://localhost:3000/registro](http://localhost:3000/registro).
2. Completá nombre, email, contraseña (mín. 8) y confirmación.
3. Enviá el formulario.
4. Si Supabase pide confirmación: revisá el email y usá el enlace (cae en `/auth/callback`).
5. Si la sesión queda activa de inmediato: deberías ir a `/` y ver el saludo con tu nombre.

## 10. Verificar profile y categorías tras el registro

En **Table Editor**:

1. `profiles`: 1 fila con el `id` del usuario y el `name` enviado en el registro.
2. `categories`: 6 filas para ese `user_id`:
   - Feater (`feater`)
   - Búsqueda laboral (`busqueda-laboral`)
   - IFEDEL (`ifedel`)
   - Facultad (`facultad`)
   - Entrenamiento (`entrenamiento`)
   - Personal (`personal`)

En SQL Editor:

```sql
SELECT id, name, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

SELECT user_id, name, slug, position
FROM public.categories
ORDER BY user_id, position;
```

La app reintenta una vez si el profile tarda unos instantes en crearse; no rompe el flujo.

## 11. Probar login / logout

1. Abrí [http://localhost:3000/login](http://localhost:3000/login).
2. Iniciá sesión con el email y la contraseña.
3. Deberías entrar a `/` y ver el nombre en el saludo y en la sidebar.
4. Recargá la página: la sesión debe mantenerse.
5. Pulsá **Cerrar sesión** (sidebar en desktop; barra superior en mobile).
6. Deberías volver a `/login`. Entrar a `/` sin sesión debe redirigir a `/login`.

## 12. Probar recuperación de contraseña

1. Abrí [http://localhost:3000/recuperar-contrasena](http://localhost:3000/recuperar-contrasena).
2. Ingresá un email (válido o no): el mensaje es genérico por seguridad.
3. Si el email existe, abrí el enlace del correo.
4. El flujo pasa por `/auth/callback?next=/actualizar-contrasena`.
5. En `/actualizar-contrasena` elegí una contraseña nueva (≥ 8) y confirmala.
6. Al guardar, deberías volver a `/login` e iniciar sesión con la nueva clave.

## 13. No compartir claves secretas

- Nunca subas `.env.local` a Git.
- Nunca pegues la **service role key** en el frontend ni en este repo.
- La publishable/anon key es pública por diseño, pero igual no la compartas en issues/chats innecesariamente.
- `/supabase-check` y los formularios de auth no imprimen URLs ni keys.

## 14. Validar que `.env.local` no se sube a Git

El `.gitignore` ignora `.env*` y permite solo `.env.local.example`:

```bash
git check-ignore -v .env.local
git status --short .env.local .env.local.example
```

Esperado:

- `.env.local` aparece como ignorado.
- `.env.local.example` puede trackearse (sin valores secretos).

## 15. Migración SQL `002` (IDs de importación local)

Después de `001_initial_schema.sql`, ejecutá:

1. Abrí `supabase/migrations/002_local_migration_ids.sql`.
2. Copiá y ejecutá en SQL Editor.
3. Verificá columnas:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'goals', 'milestones', 'daily_reviews')
  AND column_name = 'local_source_id';
ORDER BY table_name;
```

Deben existir 4 columnas `local_source_id` e índices únicos parciales `(user_id, local_source_id)`.

**No re-ejecutes `001` si ya corrió.** Usá solo migraciones nuevas.

## 16. Probar importación desde localStorage

1. (Opcional) En un navegador con datos viejos de Momentum, iniciá sesión.
2. Si `profiles.local_storage_migrated_at` es null y hay claves `momentum.*.v1`, aparece el banner.
3. Elegí **Importar ahora** o **Omitir por ahora**.
4. Tras importar, revisá el resumen (importados / omitidos / errores).
5. En Table Editor confirmá filas con `local_source_id` igual al id local.
6. Reintentá la importación: no deben duplicarse (se omiten por `local_source_id`).
7. Tras éxito: **Eliminar datos locales** (pide confirmación). No se borra al cerrar sesión.

## 17. Validar desde otro navegador

1. Creá/editá tareas, objetivos y bitácora en el navegador A.
2. Abrí Momentum en el navegador B (u otro perfil) con la misma cuenta.
3. Los datos deben coincidir (fuente: Supabase).
4. El banner de importación no debería aparecer si ya migraste o no hay datos locales.

## 18. Comprobar duplicados

```sql
SELECT user_id, local_source_id, count(*)
FROM public.tasks
WHERE local_source_id IS NOT NULL
GROUP BY 1, 2
HAVING count(*) > 1;
```

Repetí para `goals`, `milestones` y `daily_reviews`. El resultado debe estar vacío.

## Qué NO está implementado todavía

- Calendario
- Configuración
- IA / notificaciones / exportación
- Realtime / offline mode
- Retiro definitivo de las claves localStorage del código de importación
