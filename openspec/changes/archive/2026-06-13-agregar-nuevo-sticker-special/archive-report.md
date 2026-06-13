# Archive Report: agregar-nuevo-sticker-special

**Date**: 2026-06-13
**Status**: ✅ Archived

## Executive Summary

Archived the "agregar-nuevo-sticker-special" change, which introduced FWC00 as the first sticker in the FWC special section (replacing FWC20), keeping the section at 20 stickers and TOTAL_STICKERS at 1005. The change added an optional `startPosition` field to `SPECIAL_SECTIONS`, propagated it through `SpecialData` → `SpecialCard` → `StickerGrid` → `MissingListScreen`, and replaced modulo-based sticker matching with index-based matching.

## Spec Sync

| Domain | Action | Details |
|--------|--------|---------|
| special-stickers | Created | 6 requirements, 18 scenarios. New main spec at `openspec/specs/special-stickers/spec.md`. |

No existing main spec was modified — `openspec/specs/` was empty for this domain. The delta spec was copied as the full source of truth.

## Archive Contents

| Artifact | Status | Path |
|----------|--------|------|
| exploration.md | ✅ | Archive root |
| proposal.md | ✅ | Archive root |
| specs/special-stickers/spec.md | ✅ | Archive/specs |
| design.md | ✅ | Archive root |
| tasks.md | ✅ (11/11 complete) | Archive root |
| verify-report.md | ✅ (OK, no CRITICAL issues) | Archive root |
| archive-report.md | ✅ | Archive root |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `startPosition?: number` on SPECIAL_SECTIONS | Extensible for future zero-start sections; minimal type footprint. Rejected boolean `hasZeroSlot` (inflexible) and `getCode(n)` callback (over-abstracted). |
| Index-based matching (`stickers[n - startPosition]`) | Replaced fragile modulo matching (`n % 20`). No collision risk between FWC and team stickers. `isSpecial` filter in `buildTrackerData` prevents false matches. |
| FWC00 number = 961 (not 960) | 961 is the start of the special section range (48×20 = 960 team stickers). Migration shifts FWC1–FWC19 (961–979 → 962–980) via descending UPDATEs to avoid unique constraint violations. |
| `'00'` formatting only for n=0 | Conditional: `n === 0 ? '00' : String(n)`. Not zero-padding all positions (FWC1 stays FWC1, not FWC01). |
| 20-slot grid (section.count NOT used as grid width) | Keeps `STICKERS_PER_TEAM` constant. MUS (11) and COC (14) continue rendering 20-slot grids — unchanged from before. |
| Descending UPDATE order in migration | Updates FWC19→980 first, then FWC18→979, ..., FWC1→962. Prevents intermediate unique constraint violations on `stickers(album_id, number)`. |

## Lessons Learned

1. **Index-based matching is safer than modulo for special sections.** Modulo (`n%20`) caused ambiguity between position 0 and position 20 when both stickers existed. The index-based approach (`stickers[n - startPosition]`) is deterministic and avoids the collision entirely.

2. **Descending UPDATE order prevents UK violations.** When shifting a contiguous range of numbers, update from highest to lowest to avoid temporarily assigning a number already held by a later row.

3. **FWC section is unusual enough to warrant the `startPosition` abstraction.** While only FWC uses it today, the optional field pattern is clean and self-documenting — defaulting to 1 everywhere means MUS and COC code paths are unaffected.

4. **Migration fix was caught during verification, not in design.** The initial migration put FWC00 at number 960 (team sticker territory). The verify phase caught this via the modulo collision analysis in the verify report, leading to the correction to 961.

## Verification Summary

- **Test Suites**: 25 passed, 25 total
- **Tests**: 155 passed, 155 total
- **Spec Compliance**: 6/6 requirements, 18/18 scenarios ✅
- **Design Compliance**: 7/7 decisions ✅
- **Migration SQL**: 5/5 checks passed ✅
- **Code Quality**: All Clean Architecture conventions respected ✅
- **Issues**: 1 non-blocking SUGGESTION (integration test for SpecialCard+StickerGrid mounted together — covered by existing component tests)

## Re-verification Note

The change was re-verified after fixing a migration bug: FWC00 was initially at number 960 (wrong — team sticker territory). Corrected to 961 with descending UPDATEs to shift FWC1–FWC19. All tests re-ran successfully.

## README.md

Already reflects Fase 9 as complete (lines 78-85). No update needed.

## Post-Archive Concerns

None. The change is fully implemented, verified, and the migration is correct. The one open question from design.md (FWC00 rarity) was resolved as `'common'` in the seed. The image path points to Supabase Storage; if the image doesn't exist, the `Thumbnail` error fallback renders a placeholder — no runtime risk.
