# Figuritas App Exchange — Specification

## Purpose

Enables users to share their sticker collection (available duplicates + wanted missing stickers) with the external "Figuritas App" via a V2 QR-compatible encoded string. The V2 codec uses per-segment gzip-compressed bitmaps (984 bits = 123 bytes), base64-encoded, separated by `;`, and prepended with the `图救` prefix.

## Requirements

### Requirement: QR Codec V2 Encoding

The system MUST encode the user's available and wanted sticker sets into a V2 exchange string matching the format `图救<base64_gzip_bitmap_available>;<base64_gzip_bitmap_wanted>`.

- **Prefix**: MUST be `图救` (two Chinese characters meaning "exchange/rescue")
- **Segment separator**: MUST be `;` between the two base64 segments
- **Bitmap size**: MUST be exactly 123 bytes (984 bits), one bit per sticker number
- **Compression**: MUST gzip-compress raw bitmap bytes before base64 encoding
- **Encoding**: MUST use base64 of compressed data for each segment

#### Scenario: User with duplicates and missing stickers generates valid V2 QR string

- GIVEN an authenticated user with `sticker_duplicates` for stickers 1, 3, 5 and missing stickers 2, 4
- WHEN the system generates the QR string
- THEN the output starts with `图救`
- AND the output contains two base64 segments separated by `;`
- AND the available bitmap has bits 0, 2, 4 set (stickers 1, 3, 5)

#### Scenario: Available bitmap encodes only numbers 1-984

- GIVEN a `sticker_duplicate` for sticker number 999
- WHEN the system generates the QR string
- THEN sticker 999 is NOT included in the available bitmap

#### Scenario: Wanted bitmap excludes stickers beyond 984

- GIVEN a user missing sticker number 1000
- WHEN the system generates the QR string
- THEN sticker 1000 is NOT included in the wanted bitmap

### Requirement: Available Segment from Duplicates

The system MUST populate the available segment from `sticker_duplicates` entries mapped to their `number` field. Only sticker numbers 1-984 SHALL be included.

#### Scenario: No duplicates (empty available bitmap)

- GIVEN a user with zero `sticker_duplicates`
- WHEN the system generates the QR string
- THEN the available segment decodes to a 123-byte bitmap of all zeros

### Requirement: Wanted Segment from Missing Stickers

The system MUST populate the wanted segment from stickers not owned by the user, limited to numbers 1-984. A sticker is "owned" if the user has at least one `user_sticker` entry for it.

#### Scenario: Complete collection (empty wanted bitmap)

- GIVEN a user who owns every sticker numbered 1-984
- WHEN the system generates the QR string
- THEN the wanted segment decodes to a 123-byte bitmap of all zeros

### Requirement: Feature Flag

The system MUST gate figuritas-app features behind `NEXT_PUBLIC_FIGURITAS_APP_ENABLED`. The flag MUST default to `false` when unset. Config module at `src/config/figuritas-app.ts` MUST export `isFiguritasAppEnabled: boolean`.

#### Scenario: Flag disabled — API returns 404

- GIVEN `NEXT_PUBLIC_FIGURITAS_APP_ENABLED` is not set or `false`
- WHEN a request is made to `GET /api/figuritas-app/qr`
- THEN the API returns 404

#### Scenario: Flag enabled — API returns QR string

- GIVEN `NEXT_PUBLIC_FIGURITAS_APP_ENABLED` is `true`
- WHEN an authenticated request is made to `GET /api/figuritas-app/qr`
- THEN the API returns 200 with `{ qrString: "图救..." }`

### Requirement: API Authentication

The `GET /api/figuritas-app/qr` endpoint MUST require a valid authenticated session. Unauthenticated requests SHALL be rejected.

#### Scenario: Unauthenticated user

- GIVEN no authenticated session
- WHEN a request is made to `GET /api/figuritas-app/qr`
- THEN the API returns 401

### Requirement: Bitmap Layout

Each bitmap MUST be 123 bytes (984 bits). Bit N (0-indexed) SHALL represent sticker number N+1. Bits SHALL be packed MSB-first within each byte. Bit 0 of byte 0 MUST represent sticker 1.

#### Scenario: Bitmap bit ordering

- GIVEN a bitmap with only sticker 1 available (bit 0 set)
- WHEN the system generates the raw bitmap
- THEN byte 0 is `0b10000000` (0x80)
- AND bytes 1-122 are all zero
