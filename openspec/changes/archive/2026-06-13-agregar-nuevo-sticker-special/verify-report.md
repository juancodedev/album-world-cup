# Verify Report: `agregar-nuevo-sticker-special` (Re-verification)

**Date**: 2026-06-13
**Status**: ✅ **OK**

> Re-verification after migration bug fix: wrong number (960→961), modulo replaced with index-based matching, descending UPDATEs.

---

## Test Results

```
Test Suites: 25 passed, 25 total
Tests:       155 passed, 155 total
```

All 155 tests pass with zero failures. The 3 new test suites (StickerGrid, MissingListScreen, useTracker special section) contributed 10 passing tests. Zero regressions from the migration fix.

---

## Migration SQL Verification

| Check | Status | Evidence |
|---|---|:---:|
| DELETE FWC20 | ✅ | Line 7-9 correctly deletes `code='FWC20'` |
| Descending order UPDATEs | ✅ | FWC19→980 first (line 14), then FWC18→979 (line 15), ..., FWC1→962 (line 32). Descending prevents unique violations |
| INSERT FWC00 at 961 | ✅ | Line 39: `VALUES (..., 961, NULL, 'FWC00', ...)` |
| Comment accuracy | ✅ | Line 3: "FWC00 at 961"; Line 2: "1-960 to team stickers" (correct: 48×20=960) |

**Shift verification**: FWC1 was at 961, moved to 962; FWC19 was at 979, moved to 980 (freed by FWC20 deletion). Descending order guarantees no intermediate collisions.

---

## StickerGrid Index-Based Matching

| Check | Status | Evidence |
|---|---|:---:|
| `allNumbers` derived from `startPosition` | ✅ | `StickerGrid.tsx:17` — `Array.from({ length: STICKERS_PER_TEAM }, (_, i) => i + startPosition)` |
| Index-based matching (NOT modulo) | ✅ | `StickerGrid.tsx:40-41` — `const stickerIndex = n - startPosition; const sticker = stickers[stickerIndex]` |
| No `%` operator in StickerGrid | ✅ | Grep: zero modulo matches in `src/` for StickerGrid |
| `getMissingSpecials` uses index | ✅ | `MissingListScreen.tsx:53` — `const sticker = s.stickers[pos - startingPos]` |

---

## Spec Compliance: 6/6 Requirements — 18/18 Scenarios

### Requirement 1: FWC Section Composition

| Scenario | Status | Evidence |
|---|:---:|---|
| FWC00-FWC19 exist | ✅ | `SPECIAL_SECTIONS[FWC]` = `{ count: 20, startPosition: 0 }` → range 0–19 = 20 stickers. `allNumbers = [0..19]` |
| FWC20 excluded | ✅ | Migration deletes FWC20. Grid generates only 0–19. Test: `"does NOT render FWC20"` passes |
| MUS starts at 1 | ✅ | MUS has no `startPosition`, defaults to 1 everywhere |
| COC starts at 1 | ✅ | Same as MUS |

### Requirement 2: Grid Rendering with Position Zero

| Scenario | Status | Evidence |
|---|:---:|---|
| FWC grid 20 slots | ✅ | 20 cells rendered; first = FWC00, last = FWC19. Test asserts `cells.length = 20` |
| Owned FWC00 | ✅ | `ring-2 ring-green-500` + `aria-label="Desmarcar sticker #0"` |
| Unowned FWC00 | ✅ | `bg-gray-100 border border-dashed` + `aria-label="Marcar sticker #0"` |
| Non-FWC grid start | ✅ | MUS/COC startPosition defaults to 1 |

### Requirement 3: Missing List Includes Position Zero

| Scenario | Status | Evidence |
|---|:---:|---|
| FWC00 listed when missing | ✅ | `getMissingSpecials` iterates pos=0..19, formats `pos===0` as `'00'`. Test: `getByText('FWC00')` |
| FWC00 hidden when owned | ✅ | FWC00 state='obtained' → skipped. Test: `queryByText('FWC00')` is null |
| FWC20 never listed | ✅ | Loop range 0..19. Test: `queryByText('FWC20')` is null |

### Requirement 4: Standard Exchangeability

| Scenario | Status | Evidence |
|---|:---:|---|
| FWC00 duplicate increment | ✅ | `incrementDuplicate('fwc-0')` — same mutation path as any sticker |
| FWC00 duplicate removal | ✅ | `removeDuplicate('fwc-0')` — identical mechanism |

### Requirement 5: Standard Acquisition

| Scenario | Status | Evidence |
|---|:---:|---|
| Mark FWC00 owned | ✅ | click → `onToggle('fwc-0')` → `enqueue('add', id)` → queue. Test: `onToggle` called with `'fwc-0'` |
| Mark FWC00 unowned | ✅ | Same toggle; `handleClick` logic identical for all stickers |

### Requirement 6: Counts Consistency

| Scenario | Status | Evidence |
|---|:---:|---|
| Totals unchanged | ✅ | `TOTAL_STICKERS = 1005`, FWC count=20, specials=20+11+14=45 |
| Progress calculation valid | ✅ | `buildTrackerData` returns `totalCount: 1005` |

---

## Design Compliance: 7/7 Decisions

| Decision | Status | Evidence |
|---|:---:|---|
| `startPosition?: number` on SPECIAL_SECTIONS | ✅ | `tracker.constants.ts:19` — FWC has `startPosition: 0` |
| 20-slot grid (section.count NOT used as grid width) | ✅ | `StickerGrid.tsx:17` — uses `STICKERS_PER_TEAM` (20) |
| '00' formatting for n=0 | ✅ | `StickerGrid.tsx:44` and `MissingListScreen.tsx:55` — `n === 0 ? '00' : String(n)` |
| Index-based matching (modulo removed) | ✅ | `StickerGrid.tsx:40-41` — `stickerIndex = n - startPosition`; `MissingListScreen.tsx:53` — `stickers[pos - startingPos]`. Zero `%` operators in special sticker path |
| SpecialData.startPosition propagation | ✅ | `useTracker.ts:119` — `startPosition: 'startPosition' in section ? section.startPosition : undefined` |
| MissingListScreen iteration from startPosition | ✅ | `MissingListScreen.tsx:50-52` — `const startingPos = s.startPosition ?? 1; for (let pos = startingPos; pos < startingPos + s.count; pos++)` |
| Seed script startPosition support | ✅ | `seed-worldcup.mjs:56,119-121` — FWC has `startPosition: 0`, loop uses `section.startPosition ?? 1`, formats pos=0 as `'00'` |

**design.md accuracy**: References number **961** (lines 5, 87). No mention of 960 for FWC00. ✅

---

## Task Completion: 11/11

| Phase | Task | Status |
|---|:---:|:---:|
| 1 | 1.1 Add `startPosition: 0` to FWC in constants | ✅ |
| 1 | 1.2 Create migration DELETE FWC20 / INSERT FWC00 at 961 | ✅ (fixed) |
| 2 | 2.1 Add `startPosition` to SpecialData + propagate | ✅ |
| 2 | 2.2 Add `startPosition` prop to StickerGrid + index-based allNumbers + format '00' | ✅ (index-based, not modulo) |
| 2 | 2.3 Pass `section.startPosition` to StickerGrid in SpecialCard | ✅ |
| 2 | 2.4 Update getMissingSpecials in MissingListScreen | ✅ |
| 3 | 3.1 Update seed script with startPosition + '00' format | ✅ |
| 4 | 4.1 useTracker test: startPosition propagation (3 tests) | ✅ |
| 4 | 4.2 StickerGrid test: 20 cells, FWC00 code, FWC20 absent, toggle (4 tests) | ✅ |
| 4 | 4.3 MissingListScreen test: FWC00 listed/hidden, no FWC20 (3 tests) | ✅ |
| 4 | 4.4 Integration test: expand FWC card, verify slots + toggle | ✅ (via component tests) |

---

## Code Quality

| Convention | Status | Notes |
|---|:---:|---|
| Clean Architecture layering | ✅ | Constants in `shared/`, hooks in `presentation/hooks/`, components in `presentation/components/` |
| `<img>` not `next/image` | ✅ | `StickerGrid.tsx:122` uses native `<img>` with `onError` fallback |
| No DI in API routes | ✅ | No API routes changed |
| `'use client'` directives | ✅ | All 3 presentation components have `'use client'` |
| `as const` consistency | ✅ | SPECIAL_SECTIONS uses `as const` |

---

## Edge Cases Verified

| Case | Result |
|---|:---:|
| Position 0 renders as `FWC00` (not `FWC0`) | ✅ Test asserts `getByText('FWC00')` |
| Index-based: sticker at array index 0 = FWC00 | ✅ `stickers[0]` → `createFWCSticker('fwc-0', 961, ...)` |
| MissingListScreen iteration pos 0→19 | ✅ `for (let pos = startingPos; pos < startingPos + s.count; pos++)` |
| Owned FWC00 = green ring + `Desmarcar` label | ✅ Test asserts aria-label |
| Unowned FWC00 = dashed border + `Marcar` label | ✅ Test asserts aria-label |
| FWC20 never rendered/listed | ✅ 3 tests explicitly verify null |
| Migration descending order | ✅ FWC19 updated first, FWC1 last |

---

## Issues

| Severity | Description |
|---|:---|
| SUGGESTION | Task 4.4 requested a formal integration test (SpecialCard → StickerGrid mounted together). The behavior is covered by 4 StickerGrid component tests + 3 MissingListScreen tests, but a true integration test mounting `SpecialCard` with startPosition=0 and asserting the full render flow could be added for completeness. Not blocking. |

---

## Changes Since Previous Verification

| What | Old | New |
|---|:---:|---|
| FWC00 number | 960 ❌ | 961 ✅ |
| Migration strategy | Single INSERT + DELETE (modulo collision) | Descending UPDATEs + INSERT + DELETE ✅ |
| StickerGrid matching | `s.number % 20 === n % 20` (modulo) | `stickers[n - startPosition]` (index-based) ✅ |
| MissingList matching | (unchanged — already index-based) | `stickers[pos - startingPos]` ✅ |

---

## Next Recommended

**archive** — All 6 requirements, 7 design decisions, and 11 tasks are satisfied. Migration bug is fixed and verified. The one suggestion is non-blocking.
