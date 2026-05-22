'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useCallback } from 'react';
import { container } from '../../di/container';
import { StickerDTO } from '../../application/dtos/sticker.dto';
import { PlayerDTO } from '../../application/dtos/player.dto';
import { TeamDTO } from '../../application/dtos/team.dto';

interface SearchResults {
  stickers: StickerDTO[];
  players: PlayerDTO[];
  teams: TeamDTO[];
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchService = container.getSearchService();

  const searchQuery = useQuery<SearchResults>({
    queryKey: ['search', query],
    queryFn: () => searchService.searchAll(query),
    enabled: query.length >= 2,
  });

  const debouncedSetQuery = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setQuery(value);
    }, 300);
  }, []);

  return {
    query,
    setQuery: debouncedSetQuery,
    results: searchQuery.data ?? { stickers: [], players: [], teams: [] },
    isLoading: searchQuery.isLoading,
    isSearching: query.length >= 2,
  };
}
