# Design: Agregar FWC00 al special section

## Technical Approach

Add FWC00 (number 961) as first FWC sticker and remove FWC20 (number 980), keeping section count at 20 and `TOTAL_STICKERS` at 1005. Introduce optional `startPosition` on `SPECIAL_SECTIONS` entries, defaulting to 1. Propagate through `SpecialData` → `SpecialCard` → `StickerGrid` → `MissingListScreen`. Position 0 renders with code `FWC00` via conditional formatting.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `startPosition?: number` on SPECIAL_SECTIONS | Minimal type footprint; extensible for future zero-start sections | **Chosen** |
| Boolean `hasZeroSlot` flag | Inflexible; only handles one special case | Rejected |
| `getCode(n)` callback to map positions | Over-abstracted for single case | Rejected |
| `section.count` as grid width | Changes responsive layout; MUS/COC would get 11/14-col grids | Rejected — keep 20-slot grid |

**Modulo collision**: FWC20 (number 980) is deleted. FWC allNumbers range becomes 0–19. No position 20 exists, and with the index-based matching the modulo is no longer used — matching is done by array index relative to `startPosition`. Team stickers with `n%20=0` are filtered by `isSpecial` in `buildTrackerData`.

**'00' formatting**: `n === 0 ? '00' : String(n)` in StickerGrid and MissingListScreen. Not zero-padding all positions — that would rename FWC1→FWC01, breaking existing UI.

## Data Flow

```
SPECIAL_SECTIONS (startPosition)
    │
    ▼
buildTrackerData() ──► SpecialData { startPosition, stickers[] }
    │
    ├──► SpecialCard ──► StickerGrid(startPosition=0)
    │                        │
    │                        ├─ allNumbers = [0..19]
    │                        └─ code: FWC{% if n==0 '00' else n %}
    │
    └──► MissingListScreen
             │
             └─ getMissingSpecials: loop pos=startPos..startPos+count-1
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/constants/tracker.constants.ts` | Modify | Add `startPosition: 0` to FWC entry |
| `src/presentation/hooks/useTracker.ts` | Modify | Add `startPosition` to `SpecialData`; propagate in `buildTrackerData` |
| `src/presentation/components/tracker/StickerGrid.tsx` | Modify | Accept `startPosition` prop; build `allNumbers` from it; format `n=0` as `'00'` |
| `src/presentation/components/tracker/SpecialCard.tsx` | Modify | Pass `section.startPosition` to StickerGrid |
| `src/presentation/components/tracker/MissingListScreen.tsx` | Modify | Iterate from `startPosition`; map array index `pos - startPos`; format pos 0 code |
| `supabase/migrations/20260613XXXXXX_fwc00.sql` | Create | INSERT FWC00, DELETE FWC20 |
| `scripts/seed-worldcup.mjs` | Modify | Add `startPosition` to SPECIAL_SECTIONS; loop from `startPosition` |

## Interfaces / Contracts

```ts
// SPECIAL_SECTIONS entry (new optional field)
{ code: 'FWC', name: '...', count: 20, icon: '🌎', startPosition: 0 }

// SpecialData (new field)
export interface SpecialData {
  code: string;
  name: string;
  icon: string;
  count: number;
  startPosition?: number;   // NEW — defaults to 1 in consumers
  stickers: StickerDTO[];
  ownedCount: number;
}

// StickerGrid props (new prop)
interface StickerGridProps {
  teamCode: string;
  stickers: StickerDTO[];
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
  onDuplicate?: (stickerId: string) => void;
  startPosition?: number;   // NEW — defaults to 1
}
```

## Migration

```sql
-- DELETE FWC20 (number=980) if it exists
DELETE FROM stickers
WHERE album_id = '00000000-0000-0000-0000-000000000001'
  AND code = 'FWC20';

-- INSERT FWC00 (number=961)
INSERT INTO stickers (album_id, number, team_id, code, rarity,
  is_special, special_attribute, sticker_type_id, image_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  961, NULL, 'FWC00', 'common',
  true, 'FWC',
  'f0000000-0000-0000-0000-000000000003',
  'https://qwlopuygvhkopgsatdcl.supabase.co/storage/v1/object/public/stickers/2026/special/FWC/0.webp'
);
```

**Rollback**: DELETE FWC00, INSERT FWC20 (number=980, code=FWC20), revert `startPosition` removal, restore 1-based logic in StickerGrid/MissingListScreen.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `buildTrackerData` propagates `startPosition` | Jest — assert `SpecialData.startPosition` matches constant for each section |
| Unit | `StickerGrid` `allNumbers` range | Jest — render with `startPosition=0`, assert 20 cells with codes FWC00–FWC19 |
| Unit | `StickerGrid` code format `n=0` → `'00'` | Jest — assert cell text shows `FWC00` not `FWC0` |
| Unit | `getMissingSpecials` iterates from `startPosition` | Jest — FWC section yields missing list starting at FWC00 |
| Integration | FWC00 renders in tracker specials tab | Testing Library — expand FWC section, verify 20 slots with FWC00 first |
| Integration | FWC00 toggle (add/remove) | Testing Library — click FWC00 cell, verify state transition |

## Open Questions

- [ ] Should FWC00 use a distinct rarity value? Proposal states "rarity: common" for seed, but exploration suggests "limited"/"legendary" since it's unobtainable. Current seed uses `'common'` for all special stickers.
- [ ] Does the Supabase Storage bucket already contain `special/FWC/0.webp`? If not, placeholder rendering must work (already handled by Thumbnail error fallback).
