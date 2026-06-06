import { toast } from 'sonner';
import { StickerDTO } from '../../application/dtos/sticker.dto';

/**
 * Optimistically increment duplicateCount and set state to 'duplicate'
 * for the target sticker. Pure function — no side effects.
 */
export function applyOptimisticDuplicate(
  stickers: StickerDTO[],
  stickerId: string,
): StickerDTO[] {
  return stickers.map((s) =>
    s.id === stickerId
      ? { ...s, duplicateCount: s.duplicateCount + 1, state: 'duplicate' as const }
      : s,
  );
}

/** Mutation type keys for toast messages */
export type MutationType =
  | 'addSticker'
  | 'removeSticker'
  | 'incrementDuplicate'
  | 'removeDuplicate';

/** User-facing toast messages per mutation type */
export const MUTATION_MESSAGES: Record<
  MutationType,
  { success: string; error: string }
> = {
  addSticker: { success: 'Agregado', error: 'Error al marcar sticker' },
  removeSticker: { success: 'Eliminado', error: 'Error al marcar sticker' },
  incrementDuplicate: { success: 'Duplicado', error: 'Error al marcar sticker' },
  removeDuplicate: { success: 'Eliminado', error: 'Error al marcar sticker' },
};

/**
 * Show a success/error toast based on mutation outcome.
 * Pure-ish function (imports toast from sonner).
 */
export function showMutationToast(
  error: unknown,
  type: MutationType,
): void {
  const msg = MUTATION_MESSAGES[type];
  if (error) {
    toast.error(msg.error, { duration: 4000 });
  } else {
    toast.success(msg.success, { duration: 3000 });
  }
}
