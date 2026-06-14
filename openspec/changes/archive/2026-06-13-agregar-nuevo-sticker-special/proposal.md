# Proposal: Agregar FWC00 al special section

## Intent

The FWC special section currently spans codes FWC1–FWC20 (20 stickers). The user needs FWC00 as the first sticker, with FWC20 removed, so the section runs FWC00–FWC19 (still 20 stickers). No existing sticker is renumbered — FWC1–FWC19 keep their codes and DB rows. FWC00 behaves identically to other special stickers (same rarity, exchangeable, no special rules). No image exists yet; placeholder rendering suffices.

## Scope

### In Scope
- Insert FWC00 row in `stickers` table (code `'FWC00'`, number `961`, FWC section, `is_special=true`)
- Delete FWC20 row from `stickers` table
- Render grid position 0 in StickerGrid for special sections with zero-start
- Iterate position 0 in MissingListScreen for sections with zero-start
- Update seed script to generate FWC00 (position 0) and skip FWC20
- Database migration: INSERT FWC00, DELETE FWC20

### Out of Scope
- Renumbering existing FWC1–FWC19 codes or DB rows
- Image upload for FWC00
- Rarity system changes
- Exchange/trade restrictions (FWC00 is exchangeable like others)
- Changing `TOTAL_STICKERS`, FWC `count`, or album metadata
- Modifying MUS or COC sections

## Capabilities

> `openspec/specs/` is empty. This change introduces no new capability spec and modifies none. It is a data shift + UI rendering fix scoped to existing behavior.

### New Capabilities
None — the change extends existing tracker rendering to handle position 0, but no new domain capability is introduced.

### Modified Capabilities
None — spec-level behavior (tracker progress, special section count, sticker lifecycle) is unchanged.

## Approach

1. **Section config**: Add optional `startPosition` field to `SPECIAL_SECTIONS` entry. FWC gets `startPosition: 0` (default `1` for MUS, COC, and teams). Propagate via `SpecialData` interface in useTracker.

2. **StickerGrid**: Accept `startPosition` prop (default `1`). Build `allNumbers` from `startPosition` to `startPosition + STICKERS_PER_TEAM - 1`. Format position `0` as `'00'` in display code.

3. **MissingListScreen**: Iterate `pos` from `section.startPosition` to `section.startPosition + section.count - 1`. Map `pos=0` to array index `0`.

4. **Database migration**: New migration file deletes FWC20, shifts FWC1–FWC19 (numbers 961–979 → 962–980), and inserts FWC00 at number 961. FWC00 sorts first in the FWC section.

5. **Seed script**: Add `startPosition` to `SPECIAL_SECTIONS` in `seed-worldcup.mjs`. Generate stickers from `startPosition` to `startPosition + count - 1`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/constants/tracker.constants.ts` | Modified | Add `startPosition: 0` to FWC section entry |
| `src/presentation/hooks/useTracker.ts` | Modified | Add `startPosition` to `SpecialData` interface and `buildTrackerData` |
| `src/presentation/components/tracker/StickerGrid.tsx` | Modified | Accept `startPosition` prop, render position 0, format `00` code |
| `src/presentation/components/tracker/SpecialCard.tsx` | Modified | Pass `section.startPosition` to StickerGrid |
| `src/presentation/components/tracker/MissingListScreen.tsx` | Modified | Iterate from `startPosition`, handle pos 0 code format |
| `supabase/migrations/` | New | Migration: INSERT FWC00, DELETE FWC20 |
| `scripts/seed-worldcup.mjs` | Modified | Generate FWC00 (pos 0) and skip FWC20 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Matching: FWC00 (number 961) maps correctly to grid position 0 via index-based matching | Low | Index-based matching uses `n - startPosition` to map positions to sorted sticker array; no modulo involved |
| Code display: `FWC0` vs `FWC00` for position 0 | Low | Conditional formatting: `n===0 ? '00' : n` in both StickerGrid and MissingListScreen |
| Seed script divergence: old seed still generates FWC20 | Low | Update `SPECIAL_SECTIONS` in seed to use `startPosition` logic |

## Rollback Plan

1. Run reverse migration: DELETE FWC00 row, INSERT FWC20 row (number 980, `code='FWC20'`)
2. Revert `startPosition` to default `1` in constants (remove the field)
3. Revert StickerGrid/MissingListScreen to 1-based-only logic
4. All existing FWC1–FWC19 data is untouched throughout

## Dependencies

None.

## Success Criteria

- [ ] FWC00 sticker row exists in `stickers` table with `code='FWC00'`, `is_special=true`, `special_attribute='FWC'`
- [ ] FWC20 sticker row does not exist in `stickers` table
- [ ] Tracker page renders FWC grid with 20 slots: positions 0 (FWC00) through 19 (FWC19)
- [ ] Missing list shows FWC00 when unowned, with correct code format
- [ ] FWC00 can be toggled (mark as owned/missing) like any other special sticker
- [ ] `TOTAL_STICKERS` remains 1005; progress calculations unchanged
- [ ] Seed script generates FWC00–FWC19 (20 stickers) for FWC section
