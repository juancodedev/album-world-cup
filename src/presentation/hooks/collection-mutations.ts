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
  incrementDuplicate: { success: 'Repetida', error: 'Error al marcar sticker' },
  removeDuplicate: { success: 'Eliminado', error: 'Error al marcar sticker' },
};

/**
 * Optimistically decrement duplicateCount and transition state
 * for the target sticker. If count reaches 0, state becomes
 * 'obtained' (the server will correct to 'missing' if not owned).
 * Pure function — no side effects.
 */
export function applyOptimisticRemoveDuplicate(
  stickers: StickerDTO[],
  stickerId: string,
): StickerDTO[] {
  return stickers.map((s) =>
    s.id === stickerId
      ? {
          ...s,
          duplicateCount: Math.max(0, s.duplicateCount - 1),
          state: s.duplicateCount - 1 <= 0 ? 'obtained' as const : s.state,
        }
      : s,
  );
}

/**
 * Show a success/error toast based on mutation outcome.
 * Logs the full error to console for debugging,
 * and shows the actual error message as a toast description.
 */
export function showMutationToast(
  error: unknown,
  type: MutationType,
): void {
  const msg = MUTATION_MESSAGES[type];
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${type}] Mutation failed:`, error);
    toast.error(msg.error, {
      description: errorMessage,
      duration: 4000,
    });
  } else {
    toast.success(msg.success, { duration: 3000 });
  }
}
