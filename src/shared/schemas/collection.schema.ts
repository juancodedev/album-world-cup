import { z } from 'zod';

export const addStickerSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid(),
  albumId: z.string().uuid(),
});

export const incrementDuplicateSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const removeStickerSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid(),
});

export type AddStickerInput = z.infer<typeof addStickerSchema>;
export type IncrementDuplicateInput = z.infer<typeof incrementDuplicateSchema>;
export type RemoveStickerInput = z.infer<typeof removeStickerSchema>;
