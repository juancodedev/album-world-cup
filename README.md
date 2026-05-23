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
### ⬜ Fase 4 — Ranking coleccionistas
### ⬜ Fase 5 — Búsqueda y operaciones bulk

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
| `pnpm seed:worldcup` | Seed stickers via Supabase REST API |

## Plan detallado

Ver `.agents/plan-sticker-tracker.md` para el plan completo con referencias al tracker original.
