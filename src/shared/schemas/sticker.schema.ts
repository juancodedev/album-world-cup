import { z } from 'zod';

export const stickerSchema = z.object({
  id: z.string().uuid(),
  albumId: z.string().uuid(),
  number: z.number().int().positive(),
  playerId: z.string().uuid().nullable(),
  teamId: z.string().uuid().nullable(),
  stickerTypeId: z.string().uuid(),
  rarity: z.enum(['common', 'rare', 'legendary', 'holographic', 'limited']),
  imageUrl: z.string().url(),
  imageThumbnail: z.string().url().nullable(),
  isSpecial: z.boolean(),
  specialAttribute: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
