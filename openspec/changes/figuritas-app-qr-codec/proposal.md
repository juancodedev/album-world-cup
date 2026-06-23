# Proposal: Figuritas App QR Codec

## Intent

Enable users to share their sticker collection (available + wanted) with an external "Figuritas App" via a QR-compatible encoded string. Experimental feature gated behind an env var — uses a custom V2 codec (gzip + base64 bitmap) for the exchange format.

## Scope

### In Scope
- QR Codec V2 encoder (pure TS service in domain layer)
- Admin feature flag via env var + config module
- API endpoint that generates the QR string for the authenticated user
- UI button "Intercambiar vía Figuritas App" + QR code modal on tracker page
- Strict TDD: tests first for codec encoder

### Out of Scope
- QR Codec V1 (collection-only format — deferred)
- QR Codec decoder / consumer app
- QR image rendering (we produce the string; visual QR via `<img>` + QR API or lib)
- Scanner or import from external app
- DB schema changes for the feature flag

## Capabilities

### New Capabilities
- `figuritas-app-exchange`: V2 QR codec encoder that generates `站救<base64_gzip_bitmap_disponibles>;<base64_gzip_bitmap_buscadas>` from the user's collection. Covers bitmap generation (123 bytes, 984 stickers), gzip compression, base64 encoding, and segment concatenation.

### Modified Capabilities
None — no existing specs to modify.

## Approach

1. **Codec service** (`src/domain/services/qr-codec.service.ts`): Pure TS, no infra deps. Takes `(number, quantityOwned)[]`, builds two 123-byte bitmaps (available, wanted), gzips each (Node `zlib`), base64-encodes, concatenates as `站救<seg1>;<seg2>`.
2. **Feature flag** (`src/config/figuritas-app.ts`): Reads `NEXT_PUBLIC_FIGURITAS_APP_ENABLED` (default `false`). Exports `isFiguritasAppEnabled: boolean`.
3. **API route** (`src/app/api/figuritas-app/qr-codec/route.ts`): GET handler — queries user stickers, invokes codec, returns encoded string. Checks flag server-side.
4. **UI** (`src/presentation/components/figuritas-app/`): Button shown only when flag is enabled. Modal displays QR code via `<img>` pointing to a QR rendering API.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/domain/services/qr-codec.service.ts` | New | V2 codec encoder (pure domain service) |
| `src/domain/services/__tests__/qr-codec.service.test.ts` | New | Unit tests for codec |
| `src/config/figuritas-app.ts` | New | Feature flag config module |
| `src/app/api/figuritas-app/qr-codec/route.ts` | New | API endpoint returning QR string |
| `src/presentation/components/figuritas-app/` | New | Button + QR modal UI |
| `src/app/(dashboard)/tracker/` | Modified | Add Figuritas App button |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| QR format is experimental, encoder may produce incompatible output | Medium | Codec tests with known bitmaps; consumer validation deferred |
| 984-sticker limit excludes sticker 985-1005 | Low | Documented constraint; future V3 could expand bitmap |
| Env var toggle bypassable at network level | Low | API endpoint also checks flag server-side |

## Rollback Plan

Revert all new files and tracker page modification. Set `NEXT_PUBLIC_FIGURITAS_APP_ENABLED=false` (default). No DB changes to revert.

## Dependencies

- No external deps for the encoder (Node `zlib` and native `Buffer`). Optional: `pako` if client-side compression is needed later.

## Success Criteria

- [ ] Codec correctly encodes known bitmaps to expected V2 format strings
- [ ] Flag `NEXT_PUBLIC_FIGURITAS_APP_ENABLED=false` hides all UI
- [ ] API returns encoded QR string for authenticated user
- [ ] All tests pass (`pnpm test`)
