# Archive Report: cocacola-spetial

**Date**: 2026-06-13
**Status**: Archived ✅

## Summary

Fixed the Coca-Cola Exclusivos (COC) special section with a two-code design: `code: 'COC'` retained for storage/filtering, `displayCode: 'CC'` introduced for UI display. Five targeted fixes across 10 source files + 1 database migration.

## Changes Applied

1. **Display codes CC1–CC14**: Added `displayCode: 'CC'` to SPECIAL_SECTIONS COC entry
2. **14-slot grid**: Added optional `slots` prop to StickerGrid (default 20), COC section passes 14
3. **Duplicates page**: Added "Secciones Especiales" card rendering special stickers with duplicates
4. **Exchange page**: Added `specialRanges` + `formatSpecialCode` for CC code resolution
5. **DB migration**: `UPDATE code COC* → CC* WHERE special_attribute = 'COC'`

## Decisions

- **Two-code approach**: Separates storage path concern (`COC`) from display concern (`CC`)
- **`formatSpecialCode` duplication**: Intentionally duplicated in exchange page and CreateExchangeDialog per design
- **Image paths unchanged**: `/special/COC/` directory retained in Supabase Storage

## Test Results

- 173/173 tests passing (28 suites)
- +18 new tests covering displayCode, slots, duplicates, and exchange

## Artifacts Promoted

- `openspec/specs/special-stickers/spec.md` — Updated with CC prefix requirements
