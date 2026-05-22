import { z } from 'zod';

export const CreateShareSchema = z.object({
  userId: z.string().uuid(),
  isPublic: z.boolean().default(true),
  showDuplicates: z.boolean().default(true),
  showMissing: z.boolean().default(true),
  expiresInDays: z.number().int().positive().max(365).optional(),
});

export const UpdateShareSchema = z.object({
  isPublic: z.boolean().optional(),
  showDuplicates: z.boolean().optional(),
  showMissing: z.boolean().optional(),
});

export type CreateShareInput = z.infer<typeof CreateShareSchema>;
export type UpdateShareInput = z.infer<typeof UpdateShareSchema>;
