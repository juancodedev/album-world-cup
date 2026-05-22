'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useSearch } from '../../../presentation/hooks/useSearch';
import { SearchBar } from '../../../presentation/components/search/SearchBar';
import { SearchResults } from '../../../presentation/components/search/SearchResults';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import { EmptyState } from '../../../presentation/components/common/EmptyState';

export default function SearchPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { query, results, isLoading, isSearching, setQuery } = useSearch();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div>Cargando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Buscar</h1>

        <SearchBar
          onSearch={setQuery}
          isLoading={isLoading}
          placeholder="Buscar jugadores, selecciones, números..."
        />

        {!isSearching ? (
          <EmptyState
            icon="🔍"
            title="¿Qué buscas?"
            description="Busca por nombre de jugador, selección o número de lámina"
          />
        ) : (
          <SearchResults
            stickers={results.stickers}
            players={results.players}
            teams={results.teams}
            isSearching={isSearching}
            query={typeof query === 'function' ? '' : query}
            onStickerClick={(id) => router.push(`/collection/${id}`)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
