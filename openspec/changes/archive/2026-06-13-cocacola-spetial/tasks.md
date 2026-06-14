# Tasks: Coca-Cola Exclusivos (COC) Section Fixes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~220 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All COC fixes (constants, grid, duplicates, exchange, migration, seed, spec) | Single PR | ~220 lines; under budget; includes tests per TDD |

## Phase 1: Tests — Foundation & Display (TDD RED)

- [x] 1.1 Test `SpecialData` includes `displayCode` field; `buildTrackerData` maps it from `SPECIAL_SECTIONS` using `displayCode ?? code`
- [x] 1.2 Test `StickerGrid` with `slots=14` renders exactly 14 items; default `slots` renders 20
- [x] 1.3 Test `formatSpecialCode` helper: `COC`+1003 → `CC12`, `MUS`+981 → `MUS1`, unknown → `#991`
- [x] 1.4 Test duplicates page renders "Secciones especiales" card when `data.specials` has entries with `duplicateCount > 0`
- [x] 1.5 Test exchange `myDuplicates` resolves CC codes instead of `#992` for special stickers with `teamId=null`

## Phase 2: Constants, Types & DB Migration

- [ ] 2.1 Add `displayCode: 'CC'` to COC entry in `src/shared/constants/tracker.constants.ts`
- [ ] 2.2 Add `displayCode: string` to `SpecialData` interface; populate in `buildTrackerData` via `displayCode ?? code`
- [ ] 2.3 Create `supabase/migrations/20260613000001_coc_to_cc.sql`: `UPDATE stickers SET code = REPLACE(code, 'COC', 'CC') WHERE special_attribute = 'COC'`

## Phase 3: StickerGrid & SpecialCard

- [ ] 3.1 Add `slots?: number` prop to `StickerGrid`; replace hardcoded `STICKERS_PER_TEAM` with `slots ?? STICKERS_PER_TEAM` at line 17
- [ ] 3.2 In `SpecialCard`, pass `slots={section.count}` and `teamCode={section.displayCode}` to `StickerGrid`

## Phase 4: Duplicates Page

- [ ] 4.1 In `duplicates/page.tsx`, import `SPECIAL_SECTIONS`; build `specialDuplicates` array from `data.specials` with `displayCode + position`
- [ ] 4.2 Render "Secciones especiales" card after group cards with section icon, name, and duplicate entries using `section.displayCode`

## Phase 5: Exchange Code Resolution

- [ ] 5.1 In `exchange/page.tsx`, add module-level `specialRanges` and `formatSpecialCode` per design; update `myDuplicates` for special stickers
- [ ] 5.2 Update `resolveOffer` in exchange page to use `formatSpecialCode(specialAttribute, number)` for offered/requested with no `teamId`
- [ ] 5.3 In `CreateExchangeDialog.tsx`, add same `specialRanges`+`formatSpecialCode`; update `buildStickerCode` and `otherStickersByTeam` stickerCode fallback

## Phase 6: Seed, Spec & Verification (TDD GREEN)

- [ ] 6.1 Update `scripts/seed-worldcup.mjs`: add `displayCode: 'CC'` to COC config; `code` field uses `displayCode ?? code`; image path keeps `code`
- [ ] 6.2 Update `openspec/specs/special-stickers/spec.md`: replace COC1→CC1 prefix in FWC Section Composition scenario
- [ ] 6.3 Run `pnpm test` (all phases 1-5 tests now pass); run `pnpm build` to verify no regressions
