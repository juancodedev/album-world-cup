# Design: Coca-Cola Exclusivos (COC) Section Fixes

## Technical Approach

Five targeted fixes using a two-code design: `code: 'COC'` for DB filtering (`special_attribute`) and storage paths; `displayCode: 'CC'` for UI labels, sticker code generation, and DB `code` column. No shared `formatStickerCode()` utility extracted (explicitly deferred per proposal). Each display site resolves special codes locally via `SPECIAL_SECTIONS` constant.

## Architecture Decisions

### Decision: Two-code constant (code vs displayCode)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single `code: 'CC'` everywhere | Breaks image paths (`/special/COC/`) and `special_attribute` filtering | Rejected |
| Two-field: `code` + `displayCode` | One extra field on COC entry; clean separation | **Chosen** |

**Rationale**: `code: 'COC'` must persist for Supabase Storage paths (`.../special/COC/N.webp`) and `special_attribute = 'COC'` filtering. `displayCode: 'CC'` is the user-visible prefix used for sticker code display and DB `code` column values.

### Decision: StickerGrid slot sizing

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Hardcoded `STICKERS_PER_TEAM` (current) | Wrong for sections where count ≠ 20 | Rejected |
| `slots?: number` prop, default `STICKERS_PER_TEAM` | Backward-compatible; one new prop | **Chosen** |

**Rationale**: Optional `slots` prop preserves existing team grid behavior. `SpecialCard` passes `slots={section.count}`. Grid array length becomes `slots ?? STICKERS_PER_TEAM`.

### Decision: Exchange page special code resolution

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Shared `formatStickerCode()` utility | DRY but scope creep; explicitly out of scope | Deferred |
| Inline lookup at each display site | 4-site duplication until deferred refactor | **Chosen** |

**Rationale**: Four sites format special sticker codes in the exchange flow: `myDuplicates`, `resolveOffer`, `CreateExchangeDialog.buildStickerCode`, and `CreateExchangeDialog.otherStickersByTeam`. Each imports `SPECIAL_SECTIONS`, computes a static `specialRanges` array (global number → displayCode + local position), and resolves codes via `specialAttribute`. The duplication is acceptable since refactoring into a shared utility is the next planned change.

### Decision: Duplicates page layout for specials

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Merge specials into group card list | Confusing UI — special sections are not groups | Rejected |
| Separate "Secciones Especiales" card after groups | Matches tracker page layout; clear separation | **Chosen** |

**Rationale**: `specialDuplicates` iterates `data.specials`, builds entries using `section.displayCode + position`, and renders in a new card below group cards with the section icon and name.

## Data Flow

```
SPECIAL_SECTIONS[2] = { code:'COC', displayCode:'CC', count:14, ... }
  │
  ├─ code: 'COC' ──→ useTracker filter (special_attribute === 'COC')
  │              ──→ seed: image_url (.../special/COC/N.webp)
  │
  └─ displayCode: 'CC' ──→ seed: stickers.code = 'CC1'..'CC14'
                       ──→ StickerGrid: teamCode → displays 'CC1'..'CC14'
                       ──→ exchange: specialRanges lookup → 'CC12'
                       ──→ duplicates: special card entries → 'CC5'
                       ──→ DB migration: UPDATE code REPLACE('COC','CC')
```

```
DB sticker { number: 992, special_attribute: 'COC' }
  │
  ├─→ useTracker: filter → section.code='COC', displayCode='CC'
  ├─→ SpecialCard → StickerGrid(teamCode='CC', slots=14) → 14 slots
  ├─→ Duplicates page: specials loop → 'CC' + position → 'CC5'
  └─→ Exchange page: specialRanges[specialAttribute='COC']
        → localPos = (number - startGlobal) + startPosition
        → 'CC' + localPos → 'CC12'
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/constants/tracker.constants.ts` | Modify | COC entry gains `displayCode: 'CC'` |
| `src/presentation/hooks/useTracker.ts` | Modify | `SpecialData` adds `displayCode: string` field |
| `src/presentation/components/tracker/StickerGrid.tsx` | Modify | Add `slots?: number` prop; `length: slots ?? STICKERS_PER_TEAM` |
| `src/presentation/components/tracker/SpecialCard.tsx` | Modify | Pass `slots={section.count}`, `teamCode={section.displayCode}` |
| `src/app/(dashboard)/tracker/duplicates/page.tsx` | Modify | Iterate `data.specials`; render special duplicates card |
| `src/app/(dashboard)/tracker/exchange/page.tsx` | Modify | Import SPECIAL_SECTIONS; build specialRanges; fix `myDuplicates` and `resolveOffer` |
| `src/presentation/components/exchange/CreateExchangeDialog.tsx` | Modify | Import SPECIAL_SECTIONS; fix `buildStickerCode` and `otherStickersByTeam` |
| `scripts/seed-worldcup.mjs` | Modify | Add `displayCode` to COC config; `code` field uses `displayCode ?? code`; image path uses `code` |
| `supabase/migrations/20260613000001_coc_to_cc.sql` | Create | `UPDATE stickers SET code = REPLACE(code, 'COC', 'CC') WHERE special_attribute = 'COC'` |
| `openspec/specs/special-stickers/spec.md` | Modify | Update COC→CC prefix references in scenarios |

## Interfaces / Contracts

```ts
// tracker.constants.ts — COC entry
{ code: 'COC', displayCode: 'CC', name: 'Coca-Cola Exclusivos', count: 14, icon: '🥤' }

// useTracker.ts — SpecialData
interface SpecialData {
  code: string;           // 'COC' — for filtering
  displayCode: string;    // 'CC' — NEW, from section.displayCode ?? section.code
  name: string;
  icon: string;
  count: number;
  startPosition?: number;
  stickers: StickerDTO[];
  ownedCount: number;
}

// StickerGrid.tsx — new optional prop
interface StickerGridProps {
  slots?: number;  // NEW, defaults to STICKERS_PER_TEAM (20)
  // ... existing props unchanged
}

// Exchange page helper (module-level inside exchange/page.tsx and CreateExchangeDialog.tsx)
const TEAM_TOTAL = 48 * 20;
const specialRanges = (() => {
  let offset = TEAM_TOTAL + 1;
  return SPECIAL_SECTIONS.map(sec => ({
    attribute: sec.code,
    displayCode: ('displayCode' in sec ? sec.displayCode : sec.code) as string,
    startGlobal: offset,
    count: sec.count,
    startPosition: sec.startPosition ?? 1,
    _end: (offset += sec.count) - sec.count, // captured before increment
  }));
})();

function formatSpecialCode(specialAttribute: string, globalNumber: number): string {
  const r = specialRanges.find(s => s.attribute === specialAttribute);
  if (!r) return `#${globalNumber}`;
  const localPos = (globalNumber - r.startGlobal) + r.startPosition;
  return `${r.displayCode}${localPos === 0 ? '00' : String(localPos)}`;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `SpecialData` mapping includes `displayCode` | Jest: verify `buildTrackerData` output |
| Unit | `StickerGrid` with `slots=14` renders 14 items | React Testing Library |
| Unit | `formatSpecialCode` produces `CC12` for number 1003 | Jest: pure function test |
| Integration | Duplicates page renders COC section card | Mock `data.specials` with duplicates |
| Integration | Exchange page shows `CC12` not `#1003` | Mock collection with special stickers |
| DB | Migration updates `COC*`→`CC*` | `SELECT code FROM stickers WHERE special_attribute='COC'` |

## Migration

**New file**: `supabase/migrations/20260613000001_coc_to_cc.sql`

```sql
UPDATE stickers
SET code = REPLACE(code, 'COC', 'CC')
WHERE special_attribute = 'COC';
```

**Rollback**: `UPDATE stickers SET code = REPLACE(code, 'CC', 'COC') WHERE special_attribute = 'COC';`

Joins use UUIDs (`sticker_id`, `offered_sticker_id`), not `code`, so no cascading foreign key concerns.

## Open Questions

None.
