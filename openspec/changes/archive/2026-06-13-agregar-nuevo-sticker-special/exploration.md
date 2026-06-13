# Exploration: Agregar nuevo sticker special (FWC00)

## Executive Summary

The project has a "special section" with stickers coded FWC1–FWC20, MUS1–MUS11, and COC1–COC14. These are defined in `SPECIAL_SECTIONS` constant and rendered via `SpecialCard` → `StickerGrid`. FWC00 (a special sheet that is not normally obtainable — "una lámina especial que no sale") is **completely absent** from both the database seed data and all source code. Adding it requires changes across constants, the StickerGrid component (which currently hardcodes a 1-to-20 slot range), the MissingListScreen, database seed/migration, and the album metadata.

## Current State

### Data Model (stickers table)
- Table: `stickers` with columns: `id`, `album_id`, `number`, `team_id`, `sticker_type_id`, `rarity`, `image_url`, `image_thumbnail`, `is_special` (boolean), `special_attribute` (text, e.g. "FWC"), `code` (text, e.g. "FWC1"), plus player and team FK columns.
- Special stickers have: `is_special = true`, `special_attribute = 'FWC'|'MUS'|'COC'`, `team_id = null`.
- FWC stickers are numbered 961–980 (absolute), codes "FWC1" through "FWC20".

### Constants (`src/shared/constants/tracker.constants.ts`)
```ts
SPECIAL_SECTIONS = [
  { code: 'FWC', name: 'Sección Especial / Introducción', count: 20, icon: '🌎' },
  { code: 'MUS', name: 'FIFA Museum', count: 11, icon: '🏆' },
  { code: 'COC', name: 'Coca-Cola Exclusivos', count: 14, icon: '🥤' },
];
STICKERS_PER_TEAM = 20;  // used for grid sizing, even for special sections
TOTAL_STICKERS = 1005;   // 48×20 + 20 + 11 + 14
```

### Album metadata (seed SQL)
- `albums.total_stickers = 1005`, `albums.special_stickers = 45` (20+11+14)

### How the special section is rendered
1. `useTracker` hook → `buildTrackerData()` filters collection by `s.isSpecial && s.specialAttribute === section.code`, populates `SpecialData[]`.
2. Tracker page (`/tracker`) shows a tab "✨ ESPECIALES" that maps `data.specials` → `<SpecialCard>`.
3. `SpecialCard` renders each section header with progress bar, and when expanded, passes `section.stickers` to `<StickerGrid>`.
4. **`StickerGrid`** uses `STICKERS_PER_TEAM` (20) to build `allNumbers = [1..20]` and generates grid cells `{teamCode}1` through `{teamCode}20`. This works for FWC (20 stickers) but over-renders for MUS (11/20) and COC (14/20).
5. **`MissingListScreen`** iterates `pos` from 1 to `section.count` for special sections and generates codes `${section.code}${pos}`.

### Key rendering constraint
`StickerGrid` hardcodes a 1-to-20 slot range via `STICKERS_PER_TEAM`. There is **no slot 0**. Adding FWC00 with count 21 would overflow the 20-slot grid. Adding it at position 0 requires grid modification.

### Seed data
- `scripts/seed-worldcup.mjs` generates special stickers via loop `for (let i = 1; i <= section.count; i++)` — never generates a 0-indexed sticker.
- `supabase/migrations/20260601000000_seed_worldcup_2026.sql` only seeds teams/confederations/categories/sticker_types; sticker rows are inserted via the JS script.

## Affected Areas

| File | Why affected |
|------|-------------|
| `src/shared/constants/tracker.constants.ts` | Update FWC count (20→21), TOTAL_STICKERS (1005→1006) |
| `src/presentation/components/tracker/StickerGrid.tsx` | Hardcoded 1–20 slot range; needs position 0 or dynamic count for special sections |
| `src/presentation/components/tracker/SpecialCard.tsx` | May need to pass `includeZero` or dynamic count to StickerGrid |
| `src/presentation/components/tracker/MissingListScreen.tsx` | Iteration starts at 1; needs position 0 for FWC section |
| `src/presentation/hooks/useTracker.ts` | `buildTrackerData` uses section.count for ownedCount/total calculations |
| `supabase/migrations/` | **New migration** to insert FWC00 row |
| `scripts/seed-worldcup.mjs` | Add FWC00 to seed generation logic |
| `supabase/migrations/20260601000000_seed_worldcup_2026.sql` | Update `albums.special_stickers` (45→46), `albums.total_stickers` (1005→1006) |
| `src/domain/entities/sticker.entity.ts` | No changes needed — schema supports `isSpecial` + `specialAttribute` |
| `src/domain/value-objects/sticker-type.vo.ts` | No changes needed — 'special' type already exists |
| `src/infrastructure/repositories/supabase-sticker.repository.ts` | No changes needed — standard CRUD covers new sticker |

## Approaches

### Approach A: FWC00 at grid position 0, section count 21
Insert FWC00 as a sticker with `special_attribute = 'FWC'`, code `'FWC00'`, absolute number possibly 0 or 1006. Update `SPECIAL_SECTIONS` FWC count to 21. Modify `StickerGrid` to start at position 0 when section count exceeds `STICKERS_PER_TEAM` or when an `includeZero` flag is set. Modify `MissingListScreen` to handle position 0.

- **Pros**: Clean mapping of real-world code (FWC00) to grid position 0; all FWC stickers in one section.
- **Cons**: Requires non-trivial changes to StickerGrid (position 0, grid sizing beyond 20); the modulo matching logic in StickerGrid (`s.number % STICKERS_PER_TEAM === n % STICKERS_PER_TEAM`) breaks for position 0 vs position 20 ambiguity; every special section grid now shows 21 slots (20 empty for MUS/COC beyond their count).
- **Effort**: Medium

### Approach B: FWC00 at grid position 21, section count 21, dynamic grid sizing
Insert FWC00 with code "FWC21" (or keep FWC00 in DB but display at position 21). Change FWC count to 21. Make `StickerGrid` accept a `count` prop so the grid renders exactly `count` slots instead of always 20. This also fixes the MUS (11/20) and COC (14/20) over-render issue.

- **Pros**: Simplest UI logic — just add one more slot; fixes existing over-render for MUS/COC; no modulo ambiguity; StickerGrid becomes properly reusable for special sections.
- **Cons**: Doesn't map to the real-world "FWC00" name (would need to be FWC21 in grid); may conflict with user expectation of seeing "FWC00" in the UI.
- **Effort**: Low-Medium

### Approach C: FWC00 as a standalone special entry outside the FWC section
Keep FWC count at 20. Add FWC00 as a separate entry in `SPECIAL_SECTIONS` (e.g., `{ code: 'FWC0', name: 'Special Intro Sheet', count: 1, icon: '⭐' }`). It renders as its own `SpecialCard`.

- **Pros**: Minimal changes to StickerGrid (1 slot works perfectly); no grid logic changes needed; keeps existing FWC1–20 untouched.
- **Cons**: FWC00 is separate from the FWC section in the UI; adds another section card for a single sticker; may not match the user's mental model of "FWC00 belongs with FWC1–FWC20".
- **Effort**: Low

### Approach D: FWC00 at grid position 0 with special handling
Add FWC00. Keep `SPECIAL_SECTIONS` FWC count at 20 but add a flag like `hasZeroSlot: true`. The SpecialCard shows position 0 before the grid as a standalone element (not inside StickerGrid). MissingListScreen includes position 0 separately.

- **Pros**: Position 0 is visually distinct (special placement); doesn't break StickerGrid's 20-slot assumption; maps to "FWC00" name.
- **Cons**: Extra UI complexity; position 0 sticker has different behavior from grid stickers.
- **Effort**: Medium

## Recommendation

**Approach B with a display-code mapping** — Add FWC00 to the DB with actual code `'FWC00'` and `special_attribute = 'FWC'`, but have the `StickerGrid` accept a `count` prop (defaulting to `STICKERS_PER_TEAM` for backward compatibility). The `SpecialCard` passes `section.count` as the grid size. For the grid labeling, provide an optional `getCode(n)` function that maps position `n` to display code — for FWC, positions 1–20 map to `FWC1`–`FWC20` and position 0 maps to `FWC00`, rendered at the start (position 0) before the 1–20 grid. Alternatively, FWC00 could be at grid position 21 with code `FWC00`.

This avoids breaking existing behavior while adding FWC00 cleanly. The exact positioning (0 vs 21) is a UX decision best discussed with the user.

### Key data points for the new sticker row:
- `album_id`: `00000000-0000-0000-0000-000000000001`
- `number`: new absolute number (e.g., `1006` or `0`)
- `code`: `'FWC00'`
- `is_special`: `true`
- `special_attribute`: `'FWC'`
- `rarity`: `'limited'` or `'legendary'` (since it "doesn't come out")
- `image_url`: path to image in Supabase storage (e.g., `.../special/FWC/0.webp`)
- `sticker_type_id`: `'f0000000-0000-0000-0000-000000000003'` (SPECIAL type)
- `team_id`: `null`

## Risks

1. **StickerGrid modulo collision**: If FWC00 gets `number = 0`, then `0 % 20 = 0` which matches `n=20` in the existing modulo logic. Using `number = 1006` (or any non-zero value) avoids this. However, the modulo logic in StickerGrid is already fragile for special sections — MUS and COC stickers also use absolute numbers (981–1005) and rely on the same modulo trick. **Recommendation**: pass a `count` prop to StickerGrid and disable modulo matching for special sections.

2. **TOTAL_STICKERS consistency**: Changing from 1005 to 1006 affects the progress calculation, group completion stats, and the "ÁLBUM PANINI" header card. Must be updated everywhere `TOTAL_STICKERS` is referenced.

3. **Album metadata divergence**: `albums.total_stickers` and `albums.special_stickers` are hardcoded in the seed SQL. If the migration is re-run, these values would revert. Need a migration to update them or accept divergence.

4. **Image storage**: FWC00 needs an image in Supabase Storage at the expected path. If no image exists, the placeholder rendering kicks in, which is acceptable but should be verified.

5. **Exchange/duplicate system**: FWC00 being "unobtainable" may need special handling in the exchange offers system — users shouldn't be able to offer/trade it. This could surface as a post-implementation concern.

## Ready for Proposal

**Yes** — but first clarify with the user:
- Should FWC00 appear at grid position 0 (before FWC1) or at position 21 (after FWC20)?
- What rarity should FWC00 have? ("limited" suggested since it "no sale")
- Does FWC00 need any special exchange/trade restrictions?
- Is there already an image for FWC00 in Supabase Storage?
