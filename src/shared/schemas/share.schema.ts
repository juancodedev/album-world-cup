import { z } from 'zod';

export const createShareSchema = z.object({
  isPublic: z.boolean().default(true),
  showDuplicates: z.boolean().default(true),
  showMissing: z.boolean().default(true),
});

export const updateShareSchema = z.object({
  isPublic: z.boolean().optional(),
  showDuplicates: z.boolean().optional(),
  showMissing: z.boolean().optional(),
});

export type CreateShareInput = z.infer<typeof createShareSchema>;
export type UpdateShareInput = z.infer<typeof updateShareSchema>;
