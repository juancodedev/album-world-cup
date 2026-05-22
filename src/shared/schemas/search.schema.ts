import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['all', 'stickers', 'players', 'teams']).default('all'),
  albumId: z.string().uuid().optional(),
  rarity: z.enum(['common', 'rare', 'legendary', 'holographic', 'limited']).optional(),
  teamId: z.string().uuid().optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;
