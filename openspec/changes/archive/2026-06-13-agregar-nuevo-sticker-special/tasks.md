# Tasks: Agregar FWC00 al special section

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~140 (40 code + 15 migration + 85 tests) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Foundation — Constants + Migration

- [x] 1.1 Add `startPosition: 0` to FWC entry in `src/shared/constants/tracker.constants.ts` (SPECIAL_SECTIONS array)
- [x] 1.2 Create migration `supabase/migrations/20260613000000_fwc00.sql`: DELETE row with `code='FWC20'`, INSERT row for FWC00 (number=961, code='FWC00', rarity='common', is_special=true, special_attribute='FWC')

## Phase 2: Core Implementation — Data Flow & Rendering

- [x] 2.1 Add `startPosition?: number` to `SpecialData` interface in `src/presentation/hooks/useTracker.ts`; propagate from `section.startPosition ?? 1` in `buildTrackerData`
- [x] 2.2 Add `startPosition?: number` prop to `StickerGridProps` in `src/presentation/components/tracker/StickerGrid.tsx`; derive `allNumbers` range from it (default 1); format `n===0` as `'00'` in display code
- [x] 2.3 Pass `section.startPosition` to `<StickerGrid>` in `src/presentation/components/tracker/SpecialCard.tsx`
- [x] 2.4 Update `getMissingSpecials()` in `src/presentation/components/tracker/MissingListScreen.tsx`: iterate `pos` from `section.startPosition ?? 1`; map array index `pos - startPosition`; format pos 0 code as `'00'`

## Phase 3: Seed Script

- [x] 3.1 Add `startPosition` to `SPECIAL_SECTIONS` entries in `scripts/seed-worldcup.mjs` (FWC=0, MUS=1, COC=1); change sticker generation loop to start from `section.startPosition ?? 1`

## Phase 4: Testing

- [x] 4.1 Add unit tests in `tests/unit/hooks/useTracker.test.ts`: assert `SpecialData.startPosition` matches constant for FWC (0), MUS (undefined/default), COC (undefined/default)
- [x] 4.2 Add unit test in `tests/unit/components/StickerGrid.test.tsx` (create): render with `startPosition=0`, assert 20 cells, first cell code `FWC00` not `FWC0`
- [x] 4.3 Add unit test in `tests/unit/components/MissingListScreen.test.tsx` (create): FWC section with `startPosition=0` yields missing list starting at code `FWC00`
- [x] 4.4 Add integration test: expand FWC special card, verify 20 slots with FWC00 at position 0; toggle FWC00 and verify state transition
