## Exploration: Coca-Cola Exclusivos (COC) section fixes

### Current State

The COC special section is defined in `SPECIAL_SECTIONS` (`src/shared/constants/tracker.constants.ts`, line 21) as:
```ts
{ code: 'COC', name: 'Coca-Cola Exclusivos', count: 14, icon: '🥤' }
```
No `startPosition` is set (unlike FWC which has `startPosition: 0`).

The seed script (`scripts/seed-worldcup.mjs`) mirrors this configuration at lines 55-59 and generates COC stickers with codes `COC1`, `COC2`, ..., `COC14` (lines 118-134).

The `StickerGrid` component renders ALL sections with 20 slots (`STICKERS_PER_TEAM`), regardless of the section's actual `count`. For COC with 14 stickers, this produces 6 empty/disabled slots (positions 15-20).

The duplicates page (`/tracker/duplicates`) only iterates `data.groups` (regular teams), completely ignoring `data.specials`. COC stickers with `duplicateCount > 0` are invisible on this page.

The exchange page (`/tracker/exchange`) DOES include COC stickers in `myDuplicates` (via `collection.filter`), but displays them as raw global numbers (e.g., `#992`) instead of section-specific codes (e.g., `COC1`/`CC1`), because `teamId` is `null` for special stickers.

### Root Cause Analysis

| # | Issue | Root Cause | Severity |
|---|-------|-----------|----------|
| 1 | Codes show "COC" instead of "CC" | Section `code` constant is `'COC'` in both `tracker.constants.ts` and `seed-worldcup.mjs`. User expects `'CC'`. Also, the rendered code is built dynamically in `StickerGrid.tsx:45` as `\`${teamCode}${displayNum}\`` — so changing the constant alone fixes DISPLAY, but not stored DB data. | Medium |
| 2 | Grid shows 20 slots for 14 stickers | `StickerGrid.tsx:17` hardcodes `STICKERS_PER_TEAM` (20) for all sections. No `count` prop exists to override it per section. | High |
| 3 | Only 9 stickers selectable (12-20) | **Could not reproduce from code analysis.** With the current code (`startPosition` defaults to 1), all 14 stickers (positions 1-14) should be selectable and positions 15-20 disabled. The reported "only coc12-coc20 selectable" may indicate stale seed data or a different bug not visible in current source. Needs verification against live DB. | Unclear |
| 4 | COC duplicates missing from duplicates page | `duplicates/page.tsx:48-68` builds `teamDuplicates` from `data.groups` only. It never iterates `data.specials`. | High |
| 5 | Exchange page shows COC as raw numbers | `exchange/page.tsx:87-91`: when `teamId` is `null` (all special stickers), code falls back to `\`#${s.number}\`` (global number like `#992`). No special-section-aware code formatting exists. | Medium |

### Affected Areas

- **`src/shared/constants/tracker.constants.ts`** — Line 21: `code: 'COC'` must become `code: 'CC'`. Also consider adding explicit `startPosition: 1` for clarity.
- **`scripts/seed-worldcup.mjs`** — Line 58: `code: 'COC'` must become `code: 'CC'` to match constant. Also consider adding `startPosition: 1`.
- **`src/presentation/components/tracker/StickerGrid.tsx`** — Must accept a `count` prop to override `STICKERS_PER_TEAM` for sections with fewer stickers. Line 17: `Array.from({ length: STICKERS_PER_TEAM }, ...)` needs to use `count ?? STICKERS_PER_TEAM`.
- **`src/presentation/components/tracker/SpecialCard.tsx`** — Must pass `count` (or `section.stickers.length`) to `StickerGrid`. Currently line 46-53 only passes `startPosition`.
- **`src/app/(dashboard)/tracker/duplicates/page.tsx`** — Must also iterate `data.specials` and render COC/MUS/FWC duplicate entries with their section-code-based format. Current logic at lines 48-68 operates only on `data.groups`.
- **`src/app/(dashboard)/tracker/exchange/page.tsx`** — Lines 87-91: must resolve special-section codes (not `#992`). Needs access to section code mapping.
- **`src/presentation/hooks/useTracker.ts`** — `SpecialData` interface already has `code` field. Could expose a `specialStickerCodeMap` or similar helper for exchange/duplicate pages.
- **Database migration** (new) — Existing DB records have `code: 'COC1'` through `code: 'COC14'`. If we care about stored `code` field consistency, a migration to update them to `CC1`-`CC14` is needed. However, the UI generates codes dynamically from constants, not from the DB `code` field, so this is optional but recommended for data integrity.

### Approaches

#### 1. **Minimal fix: constants + grid count**

Change the `code` constant from `'COC'` to `'CC'` in `tracker.constants.ts` and `seed-worldcup.mjs`. Add `count` prop to `StickerGrid` so it renders the correct number of slots per section.

- **Pros**: Smallest change, fixes display in grid
- **Cons**: Duplicates page still broken, exchange page still shows raw numbers, DB data mismatch
- **Effort**: Low (2 files changed)

#### 2. **Complete fix: constants + grid + duplicates + exchange**

Everything from Approach 1, PLUS: fix duplicates page to show special section duplicates, fix exchange page to resolve special section codes correctly, add DB migration to update stored codes.

- **Pros**: All 4 issues fixed, consistent experience everywhere
- **Cons**: More files changed (6-7 files + 1 migration), needs careful testing of duplicates/exchange flows
- **Effort**: Medium

#### 3. **Refactor: unify sticker code display logic**

Extract a shared `formatStickerCode(sticker, sectionInfo)` utility used by StickerGrid, duplicates page, exchange page, and CreateExchangeDialog. This eliminates the 4 different code-formatting implementations scattered across the codebase.

- **Pros**: DRY, consistent display forever, easier future changes
- **Cons**: Largest scope, touches 5+ files, needs utility + tests
- **Effort**: Medium-High

### Recommendation

**Approach 2** — Complete fix without the refactor. Approach 3 (code format utility) is worthwhile but adds scope creep. It should be a follow-up improvement, not part of this bugfix change.

The core changes:
1. Change `'COC'` → `'CC'` in both constants files
2. Add `count` prop to `StickerGrid`, pass it from `SpecialCard`
3. Fix duplicates page to include `data.specials` duplicates
4. Fix exchange page to show section codes (e.g., `CC1`) for special stickers, not `#992`
5. Migration to update stored `code` column in `stickers` table from `COC*` to `CC*`

### Risks

- **Existing DB data**: Users already have collection data linked to stickers with `COC*` codes in the DB. The `code` field is NOT used for UI rendering (codes are built dynamically), but it IS stored in user_collection_stickers and exchange_offers. A migration must update ALL references safely.
- **Image URLs**: The seed script builds image URLs using the section code path: `.../special/${section.code}/${i}.webp` → `.../special/COC/1.webp`. If files in storage follow the `COC` directory name, changing the constant breaks image loading. **Must verify storage directory naming.**
- **Duplicate page design**: The duplicates page layout is team/group-oriented. Adding special sections requires a new UI section or card for special duplicates — not just a code change.
- **User's "only 9 selectable" claim**: If this is NOT a code bug but a DB/seed issue, the code fix alone won't solve it. Seed data verification is needed.

### Ready for Proposal
Yes — the root causes are clear, the affected files are identified, and approaches are compared. The orchestrator can proceed to `sdd-propose`.

---

## Key Learnings

- `StickerGrid` generates codes dynamically (`teamCode + position`), not from the DB `code` field. This means changing the constant fixes display without needing a migration — but image URLs are also path-dependent on the section code.
- The duplicates page ONLY processes `data.groups`, completely ignoring `data.specials` — a clear oversight. COC duplicates exist in the collection but are invisible.
- The exchange page includes special stickers but formats them as raw numbers (`#992`) instead of section codes (`COC1`).
- The `code` field in `stickers` table is effectively cosmetic — the UI never reads it directly for display. It exists only for storage/API consistency.
- FWC section has `startPosition: 0` and handles it differently from COC/MUS which have implicit `startPosition: 1`. Adding explicit `startPosition: 1` to COC and MUS constants would improve clarity.
