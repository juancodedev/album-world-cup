# Special Stickers Specification

## Purpose

Defines behavior of special sticker sections (FWC, MUS, COC) in the album tracker: composition, grid rendering, missing list display, exchangeability, and acquisition rules.

## Requirements

### Requirement: FWC Section Composition
The FWC special section SHALL consist of 20 stickers spanning codes FWC00 through FWC19. FWC20 MUST NOT exist as a valid sticker. Non-FWC special sections (MUS, COC) SHALL start at position 1.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| FWC00-FWC19 exist | FWC section configured | stickers loaded | 20 stickers: FWC00 (position 0) through FWC19 (position 19) |
| FWC20 excluded | FWC section configured | stickers loaded | no sticker with code FWC20 exists |
| MUS starts at 1 | MUS section configured | stickers loaded | first sticker code is MUS1 |
| COC starts at 1 | COC section configured | stickers loaded | first sticker code is COC1 |

### Requirement: Grid Rendering with Position Zero
The system MUST render special section stickers in a grid whose slot indices match section positions. FWC grid SHALL render 20 slots (positions 0-19). Other sections SHALL render from position 1.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| FWC grid 20 slots | FWC special section displayed | grid rendered | 20 slots visible; first slot is position 0 (FWC00); last slot is position 19 (FWC19) |
| Owned FWC00 | user owns FWC00 | grid rendered | position 0 shows owned state (green ring) |
| Unowned FWC00 | user lacks FWC00 | grid rendered | position 0 shows unowned state (dashed border) |
| Non-FWC grid start | MUS or COC section displayed | grid rendered | first slot is position 1 |

### Requirement: Missing List Includes Position Zero
The missing stickers list MUST include unowned special stickers using `{sectionCode}{position}` format. For FWC, this SHALL include position 0 formatted as `FWC00`.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| FWC00 listed when missing | user lacks FWC00 | missing list displayed | code FWC00 appears under FWC section |
| FWC00 hidden when owned | user owns FWC00 | missing list displayed | code FWC00 does NOT appear |
| FWC20 never listed | FWC section is FWC00-FWC19 | missing list displayed | FWC20 never appears regardless of state |

### Requirement: Standard Exchangeability
All special stickers, including FWC00, MUST behave identically to team stickers for exchange and duplicate operations. No special sticker SHALL have distinct exchange rules.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| FWC00 duplicate increment | user owns FWC00; acquires another | duplicate action triggered | duplicate count increments |
| FWC00 duplicate removal | user has FWC00 duplicate | remove duplicate triggered | duplicate count decrements |

### Requirement: Standard Acquisition
Special stickers MUST follow the same ownership toggle mechanism as team stickers, using the debounced mutation queue. FWC00 toggles identically to FWC1-FWC19.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Mark FWC00 owned | FWC00 is unowned | user toggles ownership | state changes to owned; mutation queued |
| Mark FWC00 unowned | FWC00 is owned | user toggles ownership | state changes to missing; mutation queued |

### Requirement: Counts Consistency
The system SHALL maintain `TOTAL_STICKERS = 1005` and FWC section `count = 20`. Replacing FWC20 with FWC00 MUST NOT change any aggregate count.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Totals unchanged | album fully configured | FWC00 replaces FWC20 | TOTAL_STICKERS = 1005; special_stickers = 45; FWC count = 20 |
| Progress calculation valid | user owns N stickers of 1005 | progress computed | percentage = (N / 1005) × 100 |
