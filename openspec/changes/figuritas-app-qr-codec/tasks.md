# Tasks: Figuritas App QR Codec (V2 Exchange)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~470 (including TDD tests) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + Domain | PR 2: API + UI + Wiring |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Config + Domain Service + Tests | PR 1 | Base: main. Self-contained: bitmap encoding + gzip compression logic verified by unit tests. |
| 2 | API Route + UI Components + Tracker wiring | PR 2 | Base: main. Depends on PR 1's service. Route handler, button, modal, feature flag gating. |

## Phase 1: Foundation

- [x] 1.1 Create `src/config/figuritas-app.ts` — export `isFiguritasAppEnabled()`, `QR_CODEC_MAX_STICKERS = 984`, `QR_CODEC_BITMAP_SIZE = 123`
- [x] 1.2 RED: Write test at `src/domain/services/__tests__/qr-codec.service.test.ts` — bitmap cases (all zeros, all ones, single bit per spec), full encode pattern, edge cases (empty sets, overflow, overlapping)
- [x] 1.3 GREEN: Create `src/domain/services/qr-codec.service.ts` — `QRCodecService.encodeV2()` with MSB-first bitmap, gzip, base64, `图救` prefix
- [x] 1.4 REFACTOR: Extract `createBitmap()` and `compressSegment()` private helpers, verify tests still pass

## Phase 2: API Route

- [x] 2.1 Create `src/app/api/figuritas-app/qr-codec/route.ts` — GET handler with `createServerSideClient()` auth check (401), flag check (404), sequential repo queries, `QRCodecService.encodeV2()` call, JSON response

## Phase 3: Presentation

- [x] 3.1 Create `src/presentation/components/figuritas-app/qr-codec-button.tsx` — button "Intercambiar vía Figuritas App" that calls GET /api/figuritas-app/qr-codec on click, gated by `isFiguritasAppEnabled()`
- [x] 3.2 Create `src/presentation/components/figuritas-app/qr-codec-modal.tsx` — modal showing raw QR string + "Copiar" button
- [x] 3.3 Create `src/presentation/components/figuritas-app/index.ts` — barrel export for both components
- [x] 3.4 Modify `src/app/(dashboard)/tracker/page.tsx` — import and render `QRCodecButton` below FeatureAnnouncement

## Phase 4: Environment & Config

- [x] 4.1 Add `NEXT_PUBLIC_FIGURITAS_APP_ENABLED=false` to `.env.example`
- [x] 4.2 Add `NEXT_PUBLIC_FIGURITAS_APP_ENABLED` to `wrangler.jsonc` vars (with `false` default)

## Phase 5: Verification

- [x] 5.1 Run full test suite — 206 tests pass (188 original + 18 new)
- [ ] 5.2 Manual smoke test: toggle flag on/off, verify 404 vs 200 behavior (requires deploy)
- [ ] 5.3 Verify `zlib.gzipSync()` works in Cloudflare Workers via `nodejs_compat` (deploy preview check)
