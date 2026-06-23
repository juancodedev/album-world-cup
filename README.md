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
- Códigos: `MEX1`–`MEX20`, `ARG1`–`ARG20`, especiales `FWC00`–`FWC19`, `MUS1`–`MUS11`, `COC1`–`COC14`
- Migración SQL + seed script en `scripts/seed-worldcup.mjs`

### 🔄 Fase 2 (QR) — Figuritas App QR Codec (En desarrollo — PR 2)
- Feature flag `NEXT_PUBLIC_FIGURITAS_APP_ENABLED` para activación progresiva
- Domain service `QRCodecService.encodeV2()` con bitmap MSB-first (984 bits), gzip compression, base64
- API Route `GET /api/figuritas-app/qr-codec` con autenticación y feature gating
- Componente `QRCodecButton` en tracker con modal para mostrar/copiar el código QR
- Pendiente: deploy preview para validar compatibilidad con `nodejs_compat`

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

### ✅ Fase 8 — Refinamientos de navegación y visuales (Completada)
- **Nav activo corregido**: "Tracker" usa `exact: true` para no solaparse con subrutas; "Repetidas" y "Ranking" se activan independientemente
- **Ranking en menú principal**: Agregado a Sidebar y BottomNav como item propio, removido del header del tracker
- **Stats en header**: Faltantes y Repetidas movidas de links inline a cuadros numéricos en la fila de stats (Grupos | Equipos | Stickers | Faltantes | Repetidas)
- **CircularProgress**: Componente SVG reutilizable con ring de progreso, texto "Completado" y animación suave
- **Gradiente mejorado**: Header card con gradiente `from-indigo-500 to-violet-800` para mayor contraste visual
- **Paleta unificada**: Reemplazados todos los `bg-gray-50`/`text-gray-*` restantes por tokens CSS (`bg-background`, `text-muted-foreground`, etc.)

### ✅ Fase 9 — FWC00 (special sticker) (Completada)
- FWC20 reemplazado por FWC00 (posición 0): sección mantiene 20 stickers, `TOTAL_STICKERS` = 1005
- `startPosition` opcional en `SPECIAL_SECTIONS` para secciones que no empiezan en 1
- `StickerGrid` acepta `startPosition` prop; formatea posición 0 como `'00'` (FWC00)
- `MissingListScreen` itera desde `startPosition` en secciones especiales
- `SpecialData` y `buildTrackerData` propagan `startPosition`
- Migración: `supabase/migrations/20260613000000_fwc00.sql` (DELETE FWC20, INSERT FWC00)
- Seed script actualizado con `startPosition` y formato `'00'`

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
| `pnpm test` | Jest (206 tests) |
| `pnpm seed:worldcup` | Seed stickers via Supabase REST API |

## Tests

206 tests en 32 suites, todas con datos mock:

| Categoría | Archivos | Tests |
|-----------|----------|-------|
| Value Objects | `rarity.vo`, `progress.vo`, `sticker-state.vo`, `sticker-type.vo` | 4 suites |
| Domain Entities | `user-collection.entity`, `team.entity`, `sticker.entity`, `user.entity`, `album.entity`, `account.entity`, `account-member.entity` | 7 suites |
| Use Cases | `add-sticker.use-case`, `get-shared-collection.use-case` | 3 suites (unit + integration) |
| Services | `statistics.service`, `qr-codec.service` | 2 suites |
| API Routes | `figuritas-app/qr-codec` | 1 suite |
| Components | `StickerGrid`, `MissingListScreen`, `QRCodecButton`, `QRCodecModal` | 4 suites |
| Hooks | `useTracker`, `collection-mutations` | 2 suites |
| UI | `ToasterProvider` | 1 suite |

```
pnpm test        # 32 suites, 206 tests
```

## Plan detallado

Ver `.agents/plan-sticker-tracker.md` para el plan completo con referencias al tracker original.
