'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useCollection } from '../../../presentation/hooks/useCollection';
import { StickerCard } from '../../../presentation/components/stickers/StickerCard';
import { SearchBar } from '../../../presentation/components/search/SearchBar';
import { FilterDrawer } from '../../../presentation/components/search/FilterDrawer';
import { CollectionGridSkeleton } from '../../../presentation/components/common/SkeletonLoader';
import { EmptyState } from '../../../presentation/components/common/EmptyState';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import { Button } from '../../../components/ui/button';

const DEFAULT_ALBUM_ID = '00000000-0000-0000-0000-000000000001';

export default function CollectionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string | undefined>();
  const [teamFilter, setTeamFilter] = useState<string | undefined>();
  const [specialFilter, setSpecialFilter] = useState<boolean | undefined>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const userId = user?.id || '';
  const { collection, isLoading, addSticker } = useCollection(userId, DEFAULT_ALBUM_ID);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <CollectionGridSkeleton />
      </DashboardLayout>
    );
  }

  const filteredStickers = collection.filter(sticker => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesNumber = sticker.number.toString().includes(q);
      const matchesPlayer = sticker.playerName?.toLowerCase().includes(q);
      const matchesTeam = sticker.teamName?.toLowerCase().includes(q);
      if (!matchesNumber && !matchesPlayer && !matchesTeam) return false;
    }
    if (rarityFilter && sticker.rarity !== rarityFilter) return false;
    if (specialFilter !== undefined && sticker.isSpecial !== specialFilter) return false;
    return true;
  });

  const handleAddSticker = (stickerId: string) => {
    addSticker(stickerId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Mi Colección</h1>
          <div className="flex items-center gap-2">
            <FilterDrawer
              rarity={rarityFilter}
              teamId={teamFilter}
              isSpecial={specialFilter}
              onRarityChange={setRarityFilter}
              onTeamChange={setTeamFilter}
              onSpecialChange={setSpecialFilter}
              onReset={() => {
                setRarityFilter(undefined);
                setTeamFilter(undefined);
                setSpecialFilter(undefined);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? '☰' : '▦'}
            </Button>
          </div>
        </div>

        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Buscar por número, jugador o selección..."
        />

        {isLoading ? (
          <CollectionGridSkeleton />
        ) : filteredStickers.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No hay láminas"
            description={searchQuery ? 'Intenta con otra búsqueda' : 'Comienza agregando láminas a tu colección'}
          />
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
              : 'space-y-2'
          }>
            {filteredStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                {...sticker}
                variant={viewMode}
                onClick={() => router.push(`/collection/${sticker.id}`)}
                onAddClick={() => handleAddSticker(sticker.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
