# Proposal: Coca-Cola Exclusivos (COC) Section Fixes

## Intent

The COC special section has five bugs: wrong display code (`COC`→`CC`), hardcoded 20-slot grid for 14 stickers, missing COC duplicates on the duplicates page, raw global numbers on exchange page for special stickers, and stale seed data. All code-display paths and DB data are fixed.

## Scope

### In Scope
- Add `displayCode: 'CC'` to COC section constant; keep `code: 'COC'` for filtering/storage
- Add `slots` prop to `StickerGrid` (defaults to `STICKERS_PER_TEAM`), pass `section.count` from `SpecialCard`
- Extend duplicates page to iterate `data.specials` alongside `data.groups`
- Fix exchange page special-sticker code formatting (use `displayCode` instead of `#992`)
- Update seed script to use `displayCode` for sticker `code` field, `code` for image path
- DB migration: rename `COC*`→`CC*` in `stickers.code` column
- Update `specs/special-stickers/spec.md` to reflect `CC` prefix

### Out of Scope
- Refactoring into a unified `formatStickerCode()` utility (separate change)
- Renaming Supabase Storage directory
- Migrating other MUS/FWC code conventions

## Capabilities

### Modified Capabilities
- `special-stickers`: COC code prefix changes from `COC` to `CC` for display and DB; grid sizing uses per-section count; duplicates and exchange pages include special sections

## Approach

**Two-code design**: `SPECIAL_SECTIONS[2]` keeps `code: 'COC'` (for `special_attribute` filtering and image path) and gains `displayCode: 'CC'` (for UI codes and DB `code` column). `SpecialData` interface adds `displayCode` field.

1. **Constants** — Add `displayCode: 'CC'` to COC entry. Seed script mirrors this.
2. **StickerGrid** — Add `slots?: number` prop, replace hardcoded length. SpecialCard passes `slots={section.count}` and `teamCode={section.displayCode}`.
3. **Duplicates page** — Build `specialDuplicates` from `data.specials`, render in a "Secciones especiales" card after group cards. Display code uses `section.displayCode`.
4. **Exchange page** — For special stickers (`!s.teamId`), resolve code from `SPECIAL_SECTIONS` constant via `specialAttribute` instead of `#${s.number}`.
5. **Seed script** — `code` field uses `displayCode ?? code`; `image_url` uses `code` (keeps `COC` path); `special_attribute` uses `code`.
6. **Migration** — `UPDATE stickers SET code = REPLACE(code, 'COC', 'CC') WHERE special_attribute = 'COC'`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/constants/tracker.constants.ts` | Modified | Add `displayCode: 'CC'` to COC section |
| `src/presentation/components/tracker/StickerGrid.tsx` | Modified | Add `slots` prop, use it for grid length |
| `src/presentation/components/tracker/SpecialCard.tsx` | Modified | Pass `slots` and `displayCode` to StickerGrid |
| `src/presentation/hooks/useTracker.ts` | Modified | `SpecialData` adds `displayCode`; mapping uses `displayCode ?? code` |
| `src/app/(dashboard)/tracker/duplicates/page.tsx` | Modified | Add special sections duplicate block |
| `src/app/(dashboard)/tracker/exchange/page.tsx` | Modified | Resolve special sticker codes from SPECIAL_SECTIONS |
| `scripts/seed-worldcup.mjs` | Modified | Add `displayCode`, use for `code` field; `code` for image path |
| `openspec/specs/special-stickers/spec.md` | Modified | Update COC prefix references |
| `supabase/migrations/` (new) | New | Migration to rename `COC*`→`CC*` in stickers.code |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Image loading breaks if storage path differs | Low | Seed script keeps `COC` path via `section.code` |
| `special_attribute` mismatch after migration | Low | Migration filters by `special_attribute = 'COC'` |
| Duplicates page layout breaks with new card | Medium | Render special cards below group cards with same pattern |
| Exchange offers referencing stale codes | Low | Only `stickers.code` column updated; join columns are UUIDs |

## Rollback Plan

1. Revert migration: `UPDATE stickers SET code = REPLACE(code, 'CC', 'COC') WHERE special_attribute = 'COC'`
2. Git revert the commit
3. Re-deploy; no data loss (joins are UUID-based)

## Success Criteria

- [ ] COC sticker codes display as `CC1`–`CC14` in grid, duplicates, exchange
- [ ] COC grid shows exactly 14 slots (no 15–20 empty slots)
- [ ] COC duplicates with `duplicateCount > 0` appear on duplicates page
- [ ] Exchange page shows `CC12` not `#992` for COC stickers
- [ ] `pnpm test` passes, `pnpm build` succeeds
- [ ] Migration runs without errors on existing DB
- [ ] Re-seeding produces stickers with `code: 'CC1'`–`'CC14'`
