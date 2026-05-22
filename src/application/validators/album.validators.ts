import { z } from 'zod';

export const CreateAlbumSchema = z.object({
  name: z.string().min(3).max(100),
  year: z.number().int().min(2022).max(2030),
  tournamentType: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  totalStickers: z.number().int().positive(),
  specialStickers: z.number().int().min(0).optional(),
});

export const UpdateAlbumSchema = CreateAlbumSchema.partial();

export type CreateAlbumInput = z.infer<typeof CreateAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof UpdateAlbumSchema>;
