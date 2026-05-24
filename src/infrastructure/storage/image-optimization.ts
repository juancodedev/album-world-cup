// Placeholder for image optimization utilities
export function getOptimizedImageUrl(
  url: string,
  _options: { width?: number; height?: number; quality?: number } = {},
): string {
  // When using a CDN like Cloudflare, Vercel, or imgix:
  // return `${CDN_URL}/cdn-cgi/image/width=${width},height=${height},quality=${quality}/${url}`;

  // For now, return the original URL
  return url;
}

export function getStickerThumbnail(stickerNumber: number): string {
  // Placeholder: Return URL for sticker image
  // In production, this would map to actual sticker images
  return `/images/stickers/sticker-${stickerNumber}.webp`;
}

export function getTeamFlagUrl(teamCode: string): string {
  return `/images/flags/${teamCode.toLowerCase()}.svg`;
}
