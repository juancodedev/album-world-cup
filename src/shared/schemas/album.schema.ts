import { z } from 'zod';

export const albumSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  year: z.number().int().min(2022).max(2030),
  tournamentType: z.string().min(2).max(50),
  description: z.string().max(500).nullable(),
  imageUrl: z.string().url().nullable(),
  totalStickers: z.number().int().positive(),
  specialStickers: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
