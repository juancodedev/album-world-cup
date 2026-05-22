import { z } from 'zod';

export const SearchStickerSchema = z.object({
  query: z.string().min(1).max(100),
  albumId: z.string().uuid().optional(),
  rarity: z.enum(['common', 'rare', 'legendary', 'holographic', 'limited']).optional(),
  teamId: z.string().uuid().optional(),
  isSpecial: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const StickerFilterSchema = z.object({
  albumId: z.string().uuid().optional(),
  rarity: z.enum(['common', 'rare', 'legendary', 'holographic', 'limited']).optional(),
  teamId: z.string().uuid().optional(),
  isSpecial: z.boolean().optional(),
  stickerTypeId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
});

export type SearchStickerInput = z.infer<typeof SearchStickerSchema>;
export type StickerFilterInput = z.infer<typeof StickerFilterSchema>;
