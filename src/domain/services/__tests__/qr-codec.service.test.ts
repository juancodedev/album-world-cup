import { Buffer } from 'node:buffer';
import { gunzipSync } from 'node:zlib';

import {
  QRCodecService,
  QR_CODEC_BITMAP_SIZE,
} from '../qr-codec.service';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Reverse the encodeV2 transform: extract raw bitmap bytes from a V2 segment.
 */
function decodeSegment(segment: string): Buffer {
  return gunzipSync(Buffer.from(segment, 'base64'));
}

/**
 * Verify a bitmap byte array produced by encodeV2 for the given sticker set.
 * Returns the decoded available decodedSegments for assertion.
 */
function decodeBitmaps(
  available: number[],
  wanted: number[],
): { availableBitmap: Buffer; wantedBitmap: Buffer } {
  const service = new QRCodecService();
  const qrString = service.encodeV2(available, wanted);

  expect(qrString).toMatch(/^图救.+/);
  const payload = qrString.slice('图救'.length);
  const segments = payload.split(';');
  expect(segments).toHaveLength(2);

  return {
    availableBitmap: decodeSegment(segments[0]),
    wantedBitmap: decodeSegment(segments[1]),
  };
}

/**
 * Create a Buffer from a hex string for readable assertions.
 */
function hexBuf(hex: string): Buffer {
  return Buffer.from(hex.replace(/\s+/g, ''), 'hex');
}

// ---------------------------------------------------------------------------
// createBitmap behaviour (tested through encodeV2)
// ---------------------------------------------------------------------------

describe('QRCodecService — bitmap encoding', () => {
  describe('all-zero bitmap (empty sets)', () => {
    it('returns 123 zero-bytes when both sets are empty', () => {
      const { availableBitmap, wantedBitmap } = decodeBitmaps([], []);

      expect(availableBitmap).toHaveLength(QR_CODEC_BITMAP_SIZE);
      expect(wantedBitmap).toHaveLength(QR_CODEC_BITMAP_SIZE);

      for (const b of availableBitmap) expect(b).toBe(0);
      for (const b of wantedBitmap) expect(b).toBe(0);
    });
  });

  describe('single-bit MSB-first layout', () => {
    it('encodes sticker 1 as MSB of byte 0 (0x80)', () => {
      const { availableBitmap } = decodeBitmaps([1], []);

      expect(availableBitmap).toHaveLength(QR_CODEC_BITMAP_SIZE);
      // Sticker 1 → byte 0, bit 7 = MSB → 0x80
      expect(availableBitmap[0]).toBe(0x80);
      // Remaining bytes are zero
      for (let i = 1; i < QR_CODEC_BITMAP_SIZE; i++) {
        expect(availableBitmap[i]).toBe(0);
      }
    });

    it('encodes sticker 8 as LSB of byte 0 (0x01)', () => {
      const { availableBitmap } = decodeBitmaps([8], []);

      expect(availableBitmap[0]).toBe(0x01);
      for (let i = 1; i < QR_CODEC_BITMAP_SIZE; i++) {
        expect(availableBitmap[i]).toBe(0);
      }
    });

    it('encodes sticker 9 as MSB of byte 1 (0x80)', () => {
      const { availableBitmap } = decodeBitmaps([9], []);

      expect(availableBitmap[0]).toBe(0x00);
      expect(availableBitmap[1]).toBe(0x80);
      for (let i = 2; i < QR_CODEC_BITMAP_SIZE; i++) {
        expect(availableBitmap[i]).toBe(0);
      }
    });
  });

  describe('multiple bits', () => {
    it('encodes stickers 1,3,5 as bytes 0 = 0xA8, rest zero (available)', () => {
      const { availableBitmap } = decodeBitmaps([1, 3, 5], []);

      // Sticker 1 → bit 7 (0x80), sticker 3 → bit 5 (0x20), sticker 5 → bit 3 (0x08)
      // 0x80 | 0x20 | 0x08 = 0xA8
      expect(availableBitmap[0]).toBe(0xA8);
      for (let i = 1; i < QR_CODEC_BITMAP_SIZE; i++) {
        expect(availableBitmap[i]).toBe(0);
      }
    });

    it('encodes stickers 2,4 as byte 0 = 0x50, rest zero (wanted)', () => {
      const { wantedBitmap } = decodeBitmaps([], [2, 4]);

      // Sticker 2 → bit 6 (0x40), sticker 4 → bit 4 (0x10)
      // 0x40 | 0x10 = 0x50
      expect(wantedBitmap[0]).toBe(0x50);
      for (let i = 1; i < QR_CODEC_BITMAP_SIZE; i++) {
        expect(wantedBitmap[i]).toBe(0);
      }
    });
  });

  describe('overflow (>984) is ignored', () => {
    it('ignores sticker 999 in available set', () => {
      const { availableBitmap } = decodeBitmaps([999], []);

      for (const b of availableBitmap) expect(b).toBe(0);
    });

    it('ignores sticker 1000 in wanted set', () => {
      const { wantedBitmap } = decodeBitmaps([], [1000]);

      for (const b of wantedBitmap) expect(b).toBe(0);
    });
  });

  describe('all-ones bitmap (every sticker 1-984)', () => {
    it('produces 123 bytes of 0xFF for both sets', () => {
      const allStickers = Array.from({ length: 984 }, (_, i) => i + 1);
      const { availableBitmap, wantedBitmap } = decodeBitmaps(allStickers, allStickers);

      expect(availableBitmap).toHaveLength(QR_CODEC_BITMAP_SIZE);
      expect(wantedBitmap).toHaveLength(QR_CODEC_BITMAP_SIZE);

      for (const b of availableBitmap) expect(b).toBe(0xFF);
      for (const b of wantedBitmap) expect(b).toBe(0xFF);
    });
  });
});

// ---------------------------------------------------------------------------
// encodeV2 format and integration
// ---------------------------------------------------------------------------

describe('QRCodecService — encodeV2 format', () => {
  describe('prefix and separator', () => {
    it('prepends 图救 and contains two segments separated by ;', () => {
      const service = new QRCodecService();
      const qrString = service.encodeV2([1, 3, 5], [2, 4]);

      expect(qrString).toMatch(/^图救/);
      const payload = qrString.slice('图救'.length);
      const segments = payload.split(';');
      expect(segments).toHaveLength(2);
      expect(segments[0]).toBeTruthy();
      expect(segments[1]).toBeTruthy();
    });

    it('produces deterministic output for same input', () => {
      const service = new QRCodecService();
      const a = service.encodeV2([1, 2], [3, 4]);
      const b = service.encodeV2([1, 2], [3, 4]);

      expect(a).toBe(b);
    });
  });

  describe('spec scenario: user with duplicates 1,3,5 and missing 2,4', () => {
    it('available bitmap has bits 0, 2, 4 set (=stickers 1,3,5)', () => {
      const { availableBitmap } = decodeBitmaps([1, 3, 5], [2, 4]);

      // Sticker 1 → bit 7 → byte 0 bit 7 = 0x80
      // Sticker 3 → bit 5 → byte 0 bit 5 = 0x20
      // Sticker 5 → bit 3 → byte 0 bit 3 = 0x08
      expect(availableBitmap[0]).toBe(0x80 | 0x20 | 0x08); // 0xA8
    });

    it('wanted bitmap has bits 1, 3 set (=stickers 2,4)', () => {
      const { wantedBitmap } = decodeBitmaps([1, 3, 5], [2, 4]);

      // Sticker 2 → bit 6 → byte 0 bit 6 = 0x40
      // Sticker 4 → bit 4 → byte 0 bit 4 = 0x10
      expect(wantedBitmap[0]).toBe(0x40 | 0x10); // 0x50
    });
  });

  describe('edge: overlapping numbers in both sets', () => {
    it('encodes overlapping numbers independently in each set', () => {
      const { availableBitmap, wantedBitmap } = decodeBitmaps([1, 2], [2, 3]);

      // Available has bits for 1, 2
      expect(availableBitmap[0]).toBe(0x80 | 0x40); // 0xC0
      // Wanted has bits for 2, 3
      expect(wantedBitmap[0]).toBe(0x40 | 0x20);   // 0x60
    });
  });

  describe('edge: single sticker at max (984)', () => {
    it('sets bit for sticker 984', () => {
      const { availableBitmap } = decodeBitmaps([984], []);

      // Sticker 984: byteIndex = (984-1) >> 3 = 122, bitIndex = 7 - ((984-1) & 7)
      // (983) & 7 = 7, bitIndex = 7 - 7 = 0 → LSB = 0x01
      expect(availableBitmap[122]).toBe(0x01);
    });
  });
});
