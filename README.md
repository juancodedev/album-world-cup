# Album World Cup 2026 — Panini Sticker Tracker

Aplicación web para coleccionar y dar seguimiento a las láminas del Álbum Panini FIFA World Cup 2026.

## Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Estado:** TanStack React Query v5
- **Backend:** Supabase (Auth, Database, Storage)
- **Auth:** Supabase Auth (Google, Email, Magic Link)
- **Despliegue:** Cloudflare Workers (via OpenNext)

## Fases del proyecto

### ✅ Fase 1 — Datos del Mundial 2026 (Completada)
- 48 selecciones en 12 grupos (A–L), 6 confederaciones
- 1005 stickers: 960 de selecciones (20 por equipo) + 45 especiales (Introducción, FIFA Museum, Coca-Cola)
- Códigos: `MEX1`–`MEX20`, `ARG1`–`ARG20`, especiales `FWC1`–`FWC20`, `MUS1`–`MUS11`, `COC1`–`COC14`
- Migración SQL + seed script en `scripts/seed-worldcup.mjs`

### ✅ Fase 2 — Parrilla de stickers (Completada)
- Tracker visual con grupo → equipo → sticker
- `StickerGrid`: grid compacto de stickers por equipo
- `TeamRow`: fila expandible con barra de progreso, marcar todo/limpiar
- `GroupCard`: tarjeta de grupo con 4 equipos y color distintivo
- `SpecialCard`: secciones especiales expandibles
- Tabs: grupos vs especiales
- Búsqueda por equipo/código + filtro por grupo
- Ruta: `/tracker`

### ✅ Fase 3 — Vista de faltantes (Completada)
- Listado completo de stickers faltantes organizado por grupo → equipo
- `MissingListScreen`: cada equipo muestra su bandera, nombre, código y códigos faltantes como chips cliqueables
- Secciones especiales al final con el mismo diseño
- Contador total de faltantes en el header
- Cada chip togglea el sticker a adquirido vía `useTracker`
- Estado vacío con mensaje de colección completa
- Ruta: `/tracker/missing` (enlace desde el header del tracker)
### ✅ Fase 4 — Ranking coleccionistas (Completada)
- Leaderboard global de todos los usuarios de la plataforma
- `RankingScreen`: medallas 🥇🥈🥉 para top 3, barra de progreso, nombre, avatar
- Usuario actual destacado con badge "TÚ" y fondo rosado
- Ruta: `/tracker/ranking` (enlace desde el header del tracker)
- API pública: `GET /api/ranking` — ranking global sin autenticación

### ✅ Fase 5 — Búsqueda y operaciones bulk (Completada en Fase 2)
- SearchBar para buscar equipo por nombre o código
- Chips de filtro por grupo (Todos, A–L)
- Botones "Marcar todas" / "Limpiar" por equipo en TeamRow

### ✅ Fase 6 — Página pública de ranking con CTA (Completada)
- Ranking movido a ruta pública (accesible sin login) fuera del grupo `(dashboard)`
- CTA para visitantes: banner con "Crear cuenta gratis" y "Inicia sesión" para no registrados
- Usuarios autenticados ven el ranking dentro de `DashboardLayout` con sidebar y navegación
- Ruta: `/tracker/ranking`

### ✅ Fase 7 — Mejoras UI/UX y funcionalidades (Completada)
- **Avatar en header**: Muestra nombre completo del usuario (desde `public.users`) en vez de solo email
- **Miniaturas en StickerGrid**: Las celdas del tracker muestran miniatura real de cada lámina (`imageThumbnail`)
- **Placeholder en imágenes**: Si una lámina no tiene imagen o falla al cargar, se muestra placeholder SVG con "?" y badge "OBTENIDA"
- **Debounce en Tracker**: Toggled de stickers se acumulan y guardan 5s después de la última acción
- **Compartir colección**: Página pública `/share/[code]` con stats, progreso por selección (banderas + barras), y CTA para registrarse
- **Editar láminas en Admin**: Panel admin con editor de stickers (imagen, jugador, rarity) y PATCH endpoint
- **Restricción Admin**: Solo `cl.jmunoz@gmail.com` puede acceder al panel de administración
- **Progreso por Selección**: Names de equipos correctamente poblados en barras de progreso
- **Eliminar "Buscar" del menú**: Opción de búsqueda removida del Sidebar y BottomNav
- **Atribución**: Footer con crédito a [Juan Muñoz](https://www.juancode.dev)

## Getting Started

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` | Build Next.js |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest (126 tests) |
| `pnpm seed:worldcup` | Seed stickers via Supabase REST API |

## Tests

126 tests en 20 suites, todas con datos mock:

| Categoría | Archivos | Tests |
|-----------|----------|-------|
| Value Objects | `rarity.vo`, `progress.vo`, `sticker-state.vo`, `sticker-type.vo` | 4 suites |
| Domain Entities | `user-collection.entity`, `team.entity`, `sticker.entity`, `user.entity`, `album.entity`, `account.entity`, `account-member.entity` | 7 suites |
| Use Cases | `add-sticker.use-case`, `get-shared-collection.use-case` | 3 suites (unit + integration) |
| Services | `statistics.service` | 1 suite |

```
pnpm test        # 20 suites, 126 tests
```

## Plan detallado

Ver `.agents/plan-sticker-tracker.md` para el plan completo con referencias al tracker original.
