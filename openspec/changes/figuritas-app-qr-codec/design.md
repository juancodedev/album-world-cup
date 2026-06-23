# Design: Figuritas App QR Codec (V2 Exchange)

## Technical Approach

Build a pure domain service that encodes sticker collection state into the V2 Figuritas App exchange format (bitmap → gzip → base64). Gate behind an env var. Expose via a single GET endpoint the frontend calls on demand. No new DB schemas or external dependencies. API routes follow the existing pattern — instantiate repos directly, bypass DI.

## Architecture Decisions

### Compression library

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Node `zlib` | Built-in, no dep, works on CF Workers via `nodejs_compat` | **Chosen** |
| `pako` | Browser-compatible, extra 40KB bundle | Rejected — server-only operation |

### Route structure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `figuritas-app/qr/route.ts` | Shorter, less specific | Rejected — `qr-codec` namespaces future codec variants |
| `figuritas-app/qr-codec/route.ts` | Longer, explicit | **Chosen** |

### Application layer

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Use case class + DI entry | Follows orchestration pattern, testable | Rejected — API routes bypass DI per project convention |
| Direct in route handler | Matches share/collection route patterns, fewer files | **Chosen** |

### QR rendering

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Raw string + copy button | No deps, works now | **Chosen** |
| QR image via API/lib | Needs external service or lib | Deferred — consumer app scans the string |

## Data Flow

```
Tracker page
  ↓ click "Intercambiar vía Figuritas App"
  ↓ isFiguritasAppEnabled() === true?
  ↓
GET /api/figuritas-app/qr-codec?accountId=X&albumId=Y
  ↓ auth check (getUser) → 401
  ↓ server-side flag check → 404 if disabled
  ↓ parallel queries:
  ├─ StickerRepo.getByAlbum(albumId) → number→id map
  ├─ StickerDuplicateRepo.findByUser(accountId,userId) → available numbers
  └─ UserCollectionRepo.findByUser(accountId,userId) → owned numbers
  ↓ compute wanted = allAlbumNumbers − ownedNumbers
  ↓ QRCodecService.encodeV2(available, wanted)
  ↓ { qrString: "图救<base64seg1>;<base64seg2>" }
  ↓
Modal: raw string + "Copiar" button
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/domain/services/qr-codec.service.ts` | Create | Pure V2 encoder — bitmap → gzip → base64 → concatenate |
| `src/domain/services/__tests__/qr-codec.service.test.ts` | Create | Unit tests |
| `src/config/figuritas-app.ts` | Create | `isFiguritasAppEnabled()` flag reader |
| `src/app/api/figuritas-app/qr-codec/route.ts` | Create | GET handler with auth + queries + encoding |
| `src/presentation/components/figuritas-app/qr-codec-button.tsx` | Create | Button with flag gate |
| `src/presentation/components/figuritas-app/qr-codec-modal.tsx` | Create | Modal with QR string display |
| `src/app/(dashboard)/tracker/page.tsx` | Modify | Import and render button |

## Interfaces

```typescript
// src/domain/services/qr-codec.service.ts
export class QRCodecService {
  constructor(private readonly maxStickers = 984) {}
  encodeV2(available: number[], wanted: number[]): string
  // private helpers: createBitmap(), compressSegment()
}

// src/config/figuritas-app.ts
export function isFiguritasAppEnabled(): boolean

// API response (GET /api/figuritas-app/qr-codec)
type QRCodecResponse = { qrString: string }
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Bitmap: all zeros, all ones, single bits | Known input → assert exact 123-byte array |
| Unit | Full encode: compression + base64 + prefix | Assert output matches `图救<seg>;<seg>` pattern |
| Unit | Edge: empty sets, max 984, overlapping numbers | No crash, deterministic output |
| Integration | API: happy path, unauthenticated, flag disabled | Mock repos, assert status codes |

## Migration / Rollout

Set `NEXT_PUBLIC_FIGURITAS_APP_ENABLED=false` (default) in `.env.local`. Enable via Cloudflare dashboard → Workers & Pages → album-world-cup → Variables when ready. No DB migration needed.

## Open Questions

- [ ] Confirm `图救` prefix with product (proposal used `站救` — verify canonical).
- [ ] Verify `zlib.gzipSync()` works on CF Workers (OpenNext nodejs_compat layer).
- [ ] 984-sticker cap: confirm no album exceeds this (current album is ~670 stickers, future-proofed).
