# Plan: Sticker Tracker Panini World Cup 2026

Basado en el análisis del tracker de referencia (`~/Downloads/index (1).html`), una SPA hecha con React + Supabase directo (sin framework).

## Features detectadas en el HTML de referencia

| Feature | Descripción |
|---------|-------------|
| Datos del Mundial 2026 | 48 selecciones en 12 grupos (A–L), códigos (MEX, ARG, etc.), banderas emoji, indicadores host/debut |
| Secciones especiales | Introducción (20), FIFA Museum (11), Coca-Cola Exclusivos (14) — códigos FWC, MUS, COC |
| Parrilla de stickers | Grid interactivo con estado owned/missing, badge de código |
| Progreso por equipo | Barra de progreso 0–20, expand/collapse para ver stickers individuales |
| Progreso por grupo | Tarjeta con % total del grupo, 4 equipos adentro |
| Vista de faltantes | Lista filtrada solo con lo que falta, agrupado por grupo → equipo → sticker |
| Ranking coleccionistas | Leaderboard con medallas, barras de progreso, % completado |
| Operaciones bulk | "Marcar todas" / "Limpiar" por equipo |
| Búsqueda | Filtro por nombre de equipo o código |
| Colores por grupo | Cada grupo tiene color distintivo (A=rojo, B=azul, etc.) |
| Tabs | Grupos vs Especiales |
| Autenticación | Email + PIN de 4 dígitos (menos robusto que auth actual) |
| Offline fallback | Progreso guardado en localStorage |

---

## Fase 1 — ✅ COMPLETADA: Sembrar datos del Mundial 2026

**Rama:** `feature/seed-worldcup-2026`
**Commit:** `02cc4a9`

- Migración SQL: álbum, 6 confederaciones, 48 selecciones, tipos de sticker, categorías
- Seed script: 1005 stickers insertados via REST API (960 selecciones + 45 especiales)
- Datos en Supabase verificados: códigos `MEX1`–`PAN20`, especiales `FWC1`–`COC14`, numbering 1–1005
- Códigos de sticker siguen el patrón: `{TEAM_CODE}{NUMBER}` (ej. `MEX1`, `ARG13`, `FWC1`)

---

## Fase 2 — 🟡 PENDIENTE: Parrilla de stickers (grid tracker)

Convertir el tracker del HTML de referencia en componentes de Next.js.

### Componentes a crear:

1. **`StickerGrid`** — Grid de stickers individuales
   - Input: `albumId`, `teamCode?`, `sectionCode?`, owned set
   - Output: toggle sticker owned/unowned via API
   - Cada celda: nº de sticker, check si owned, color verde si owned
   - Basado en: `StickerGrid` en HTML (ls 603-617)

2. **`TeamRow`** — Fila de equipo expandible
   - Barra de progreso (0–20)
   - Indicadores: bandera, nombre, badges (SEDE, DEBUT)
   - Expandir muestra `StickerGrid` del equipo
   - Botones "Marcar todas" / "Limpiar"
   - Basado en: `TeamRow` en HTML (ls 619-652)

3. **`GroupCard`** — Tarjeta de grupo con 4 equipos
   - Color distintivo por grupo
   - % de progreso del grupo
   - Lista de `TeamRow`
   - Basado en: `GroupCard` en HTML (ls 654-679)

4. **`SpecialCard`** — Sección especial expandible
   - Similar a TeamRow pero para especiales (FWC, MUS, COC)
   - Basado en: `SpecialCard` en HTML (ls 681-704)

### Estado global:
- `owned: Set<string>` — stickers marcados como obtenidos (por código: `"MEX1"`)
- Toggle: agregar/quitar del set + sync a Supabase
- Sincronización: POST a tabla `user_stickers` o similar

### Endpoints necesarios:
- `GET /api/stickers/progress?albumId&userId` → obtener owned set
- `POST /api/stickers/toggle` → marcar/desmarcar sticker

---

## Fase 3 — 🟡 PENDIENTE: Vista de faltantes

Lista completa de stickers que le faltan al usuario, organizada por grupo → equipo.

### Componentes:
1. **`MissingListScreen`** — Pantalla completa de faltantes
   - Mismas secciones que el tracker (grupos + especiales)
   - Solo muestra stickers que NO están en `owned`
   - Botón para marcar como adquirido directamente
   - Total de faltantes al inicio
   - Basado en: `MissingListScreen` en HTML (ls 509-598)

---

## Fase 4 — 🟡 PENDIENTE: Ranking de coleccionistas

Leaderboard comparativo entre usuarios.

### Componentes:
1. **`RankingScreen`** — Tabla de posiciones
   - Medallas para top 3 (🥇🥈🥉)
   - Barra de progreso por usuario
   - Nombre, avatar, stickers count, %
   - Destacar usuario actual (badge "TÚ")
   - Basado en: `RankingScreen` en HTML (ls 462-507)

### Endpoints necesarios:
- `GET /api/ranking` → progreso de todos los usuarios
- `GET /api/users/profiles` → nombres y avatares

---

## Fase 5 — 🟡 PENDIENTE: Búsqueda y operaciones bulk

### Funcionalidades:
1. **SearchBar** — Buscar equipo por nombre o código
   - Filtra grupos mostrados
   - Basado en HTML ls 811

2. **Filtro por grupo** — Chips para seleccionar grupo específico ("Todos", "A", "B", ...)

3. **Bulk mark** — En TeamRow: "Marcar todas" marca 20 stickers, "Limpiar" desmarca todas

---

## Notas técnicas

- El HTML usa formatos de sticker `{CODE}{N}` donde CODE es el código de 3 letras del equipo o sección especial
- Ejemplos equipo: `MEX1`, `ARG13`, `PAN20`
- Ejemplos especial: `FWC1`, `FWC20`, `MUS1`, `MUS11`, `COC1`, `COC14`
- `special_attribute` en stickers: `"FWC"`, `"MUS"`, `"COC"` para identificar sección
- Los números de sticker son 1–1005 secuencial (960 equipo + 45 especial)
- Archivo referencia: `~/Downloads/index (1).html`
