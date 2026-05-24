'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../presentation/providers/AuthProvider';
import { useStickerDetail } from '../../../../presentation/hooks/useStickers';
import { useCollection } from '../../../../presentation/hooks/useCollection';
import { useCurrentAccount } from '../../../../presentation/hooks/useCurrentAccount';
import { RareStickerBadge } from '../../../../presentation/components/stickers/RareStickerBadge';
import { DuplicateCounter } from '../../../../presentation/components/collection/DuplicateCounter';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Button } from '../../../../components/ui/button';
import { DashboardLayout } from '../../../../presentation/layouts/DashboardLayout';

function StickerImage({ imageUrl, number }: { imageUrl: string; number: number }) {
  const [error, setError] = useState(false);
  const hasImage = Boolean(imageUrl);

  if (!hasImage || error) {
    return (
      <div className="text-center">
        <span className="text-5xl text-gray-300 block mb-1">?</span>
        <span className="text-[10px] font-bold text-gray-400">#{number}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`#${number}`}
      className="w-full h-full object-contain p-4"
      onError={() => setError(true)}
    />
  );
}

const DEFAULT_ALBUM_ID = '00000000-0000-0000-0000-000000000001';

export default function StickerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const stickerId = params.id as string;
  const { data: defaultAccount } = useCurrentAccount(user?.id);
  const accountId = defaultAccount?.id || '';

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const { data: sticker, isLoading } = useStickerDetail(stickerId, user?.id, accountId);
  const { addSticker, addStickerAsync, removeSticker, incrementDuplicate, removeDuplicate } = useCollection(
    accountId,
    DEFAULT_ALBUM_ID,
  );

  if (authLoading || !user || isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sticker) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-gray-500">Lámina no encontrada</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          ← Volver
        </button>

        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border">
          <div className="aspect-[63/88] relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <StickerImage imageUrl={sticker.imageUrl} number={sticker.number} />
          </div>

          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-mono">#{sticker.number}</span>
                <RareStickerBadge rarity={sticker.rarity} size="md" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {sticker.playerName || 'Lámina especial'}
              </h2>
              {sticker.teamName && (
                <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                  {sticker.teamFlag && <span>{sticker.teamFlag}</span>}
                  {sticker.teamName}
                  {sticker.playerPosition && ` · ${sticker.playerPosition}`}
                </p>
              )}
            </div>

            {sticker.isSpecial && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
                <p className="text-sm font-medium text-amber-800">
                  ⭐ Lámina especial {sticker.specialAttribute ? `- ${sticker.specialAttribute}` : ''}
                </p>
              </div>
            )}

            {accountId && (
              <div className="flex items-center justify-center py-3">
                <DuplicateCounter
                  count={sticker.duplicateCount}
                  onIncrement={() => incrementDuplicate({ stickerId, userId: user.id, quantity: 1 })}
                  onDecrement={() => removeDuplicate({ stickerId, userId: user.id, quantity: 1 })}
                />
              </div>
            )}

            <div className="flex gap-2">
              {!accountId && (
                <p className="text-sm text-gray-500 text-center w-full">
                  Necesitas tener una cuenta para coleccionar láminas
                </p>
              )}
              {sticker.state === 'missing' && accountId && (
                <Button className="flex-1" onClick={async () => {
                  await addStickerAsync({ stickerId, userId: user.id });
                  router.push('/search');
                }}>
                  ✓ Marcar como obtenida
                </Button>
              )}
              {(sticker.state === 'obtained' || sticker.state === 'duplicate') && accountId && (
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => removeSticker({ stickerId, userId: user.id })}
                >
                  Quitar de colección
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
