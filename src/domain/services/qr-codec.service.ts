import { Buffer } from 'node:buffer';
import { gzipSync } from 'node:zlib';

export const QR_CODEC_MAX_STICKERS = 984;
export const QR_CODEC_BITMAP_SIZE = 123;

const QR_PREFIX = '图救';
const QR_SEPARATOR = ';';

function createBitmap(stickerNumbers: number[]): Buffer {
  const bitmap = Buffer.alloc(QR_CODEC_BITMAP_SIZE, 0);

  for (const n of stickerNumbers) {
    if (n < 1 || n > QR_CODEC_MAX_STICKERS) continue;

    const byteIndex = (n - 1) >> 3; // integer division by 8
    const bitIndex = 7 - ((n - 1) & 7); // MSB-first: bit 7 = first sticker in byte
    bitmap[byteIndex] |= 1 << bitIndex;
  }

  return bitmap;
}

function compressSegment(bitmap: Buffer): string {
  const compressed = gzipSync(bitmap);
  return Buffer.from(compressed).toString('base64');
}

export class QRCodecService {
  constructor(private readonly maxStickers = QR_CODEC_MAX_STICKERS) {}

  /**
   * Encodes available and wanted sticker numbers into a V2 exchange QR string.
   * @param available - Array of sticker numbers (1-984) the user has as duplicates
   * @param wanted - Array of sticker numbers (1-984) the user is missing
   * @returns QR string in format: 图救<seg1>;<seg2>
   */
  encodeV2(available: number[], wanted: number[]): string {
    const availableBitmap = createBitmap(available);
    const wantedBitmap = createBitmap(wanted);

    const seg1 = compressSegment(availableBitmap);
    const seg2 = compressSegment(wantedBitmap);

    return `${QR_PREFIX}${seg1}${QR_SEPARATOR}${seg2}`;
  }
}
