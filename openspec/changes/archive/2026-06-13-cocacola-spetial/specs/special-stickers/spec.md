# Delta for Special Stickers

## ADDED Requirements

### Requirement: COC Display Code Prefix

The COC section SHALL use `CC` as its user-facing code prefix. All COC sticker codes MUST render as CC1 through CC14 across all UI surfaces: grid, missing list, duplicates page, and exchange interface. The internal section attribute (`special_attribute`) MUST remain `COC` for filtering and image paths.

#### Scenario: Grid renders CC codes
- GIVEN COC section displayed in the grid
- WHEN grid renders
- THEN every sticker code uses CC prefix (CC1, ..., CC14)
- AND no COC-prefixed code appears

#### Scenario: Exchange shows CC codes
- GIVEN user has COC stickers for exchange
- WHEN exchange interface renders
- THEN COC stickers display CC-prefixed codes (e.g., CC12)
- AND raw global numbers (e.g., #992) are NOT used for COC stickers

### Requirement: COC Grid Slot Count

The COC section grid SHALL render exactly 14 sticker slots, matching the section's defined count.

#### Scenario: 14 slots rendered
- GIVEN COC section with count=14
- WHEN grid renders
- THEN 14 slots visible (positions 1-14)
- AND no empty/disabled slots at positions 15-20

### Requirement: COC Duplicates Visibility

COC stickers with `duplicateCount > 0` SHALL appear in the duplicates page under a special sections area, displaying CC-prefixed codes.

#### Scenario: Duplicates shown
- GIVEN user has COC stickers with duplicates
- WHEN duplicates page renders
- THEN COC stickers appear with CC codes and duplicate counts

#### Scenario: No duplicates omitted
- GIVEN user has COC stickers but zero duplicates
- WHEN duplicates page renders
- THEN no COC entries appear

### Requirement: COC Database Code Column

The `stickers.code` column SHALL store CC1 through CC14 for COC entries. A migration MUST rename existing COC-prefixed codes to CC prefix for rows where `special_attribute = 'COC'`.

#### Scenario: Migration transforms existing codes
- GIVEN rows with code COC1-COC14 and special_attribute='COC'
- WHEN migration runs
- THEN codes become CC1-CC14
- AND special_attribute remains 'COC'

#### Scenario: Seed produces CC codes
- GIVEN fresh database
- WHEN seed script runs for COC section
- THEN stickers have code CC1-CC14
- AND special_attribute is 'COC'
- AND image URLs retain COC path prefix

## MODIFIED Requirements

### Requirement: Grid Rendering with Position Zero

The system MUST render special section stickers in a grid whose slot count matches the section's sticker count. FWC grid SHALL render 20 slots (positions 0-19). Other sections SHALL render from position 1 with their section-defined count.
(Previously: All sections rendered 20 slots regardless of section count)

#### Scenario: FWC grid 20 slots
- GIVEN FWC special section displayed
- WHEN grid rendered
- THEN 20 slots visible; first slot is position 0 (FWC00); last slot is position 19 (FWC19)

#### Scenario: Owned FWC00
- GIVEN user owns FWC00
- WHEN grid rendered
- THEN position 0 shows owned state (green ring)

#### Scenario: Unowned FWC00
- GIVEN user lacks FWC00
- WHEN grid rendered
- THEN position 0 shows unowned state (dashed border)

#### Scenario: Non-FWC grid start
- GIVEN MUS or COC section displayed
- WHEN grid rendered
- THEN first slot is position 1

#### Scenario: COC grid 14 slots
- GIVEN COC section with count=14 displayed
- WHEN grid rendered
- THEN exactly 14 slots visible (positions 1-14)
- AND no slots at positions 15-20
