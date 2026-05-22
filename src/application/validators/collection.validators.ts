import { z } from 'zod';

export const AddStickerSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid(),
  albumId: z.string().uuid(),
});

export const IncrementDuplicateSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const RemoveDuplicateSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export type AddStickerInput = z.infer<typeof AddStickerSchema>;
export type IncrementDuplicateInput = z.infer<typeof IncrementDuplicateSchema>;
export type RemoveDuplicateInput = z.infer<typeof RemoveDuplicateSchema>;
