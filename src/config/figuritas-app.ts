export const QR_CODEC_MAX_STICKERS = 984;
export const QR_CODEC_BITMAP_SIZE = 123;

export function isFiguritasAppEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FIGURITAS_APP_ENABLED === 'true';
}
