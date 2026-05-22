'use client';

import { useQuery } from '@tanstack/react-query';
import { container } from '../../di/container';
import { StickerDTO } from '../../application/dtos/sticker.dto';

export function useStickers(albumId: string) {
  const stickerService = container.getGetAllStickersUseCase();

  return useQuery<StickerDTO[]>({
    queryKey: ['stickers', albumId],
    queryFn: () => stickerService.execute(albumId),
    enabled: !!albumId,
  });
}

export function useStickerDetail(stickerId: string, userId?: string) {
  const stickerDetailService = container.getGetStickerDetailsUseCase();

  return useQuery({
    queryKey: ['sticker-detail', stickerId, userId],
    queryFn: () => stickerDetailService.execute(stickerId, userId),
    enabled: !!stickerId,
  });
}
