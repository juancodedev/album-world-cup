'use client';

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { useCurrentAccount } from './useCurrentAccount';
import { useCollection } from './useCollection';
import { GROUP_ORDER, SPECIAL_SECTIONS, STICKERS_PER_TEAM, TOTAL_STICKERS } from '../../shared/constants/tracker.constants';
import { FLAG_EMOJI } from '../../shared/constants/flags.constants';
import { StickerDTO } from '../../application/dtos/sticker.dto';

interface TeamInfo {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  group_stage: string;
}

export interface TrackerTeam {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  stickers: StickerDTO[];
  ownedCount: number;
}

export interface GroupData {
  id: string;
  teams: TrackerTeam[];
  totalOwned: number;
  totalCount: number;
}

export interface SpecialData {
  code: string;
  name: string;
  icon: string;
  count: number;
  startPosition?: number;
  stickers: StickerDTO[];
  ownedCount: number;
}

interface TrackerData {
  groups: GroupData[];
  specials: SpecialData[];
  totalOwned: number;
  totalCount: number;
  totalDuplicates: number;
}

const ALBUM_ID = '00000000-0000-0000-0000-000000000001';
const DEBOUNCE_MS = 1000;

function buildTrackerData(collection: StickerDTO[], teams: TeamInfo[], localToggles: Set<string>): TrackerData {
  function isOwned(sticker: StickerDTO): boolean {
    if (localToggles.has(sticker.id)) return !(sticker.state !== 'missing');
    return sticker.state !== 'missing';
  }

  const groupMap = new Map<string, TeamInfo[]>();

  for (const team of teams) {
    const existing = groupMap.get(team.group_stage) || [];
    existing.push(team);
    groupMap.set(team.group_stage, existing);
  }

  const groups: GroupData[] = [];
  let totalOwned = 0;

  for (const groupId of GROUP_ORDER) {
    const groupTeams = groupMap.get(groupId);
    if (!groupTeams) continue;

    const groupTeamsData = groupTeams.map(team => {
      const stickers = (collection
        .filter(s => s.teamId === team.id)
        .sort((a, b) => a.number - b.number));

      const ownedCount = stickers.filter(s => isOwned(s)).length;
      return {
        id: team.id,
        code: team.code,
        name: team.name,
        flag: team.flag_url || FLAG_EMOJI[team.code] || null,
        stickers,
        ownedCount,
      };
    });

    const groupOwned = groupTeamsData.reduce((sum, t) => sum + t.ownedCount, 0);
    const groupTotal = groupTeamsData.length * STICKERS_PER_TEAM;
    totalOwned += groupOwned;

    groups.push({
      id: groupId,
      teams: groupTeamsData,
      totalOwned: groupOwned,
      totalCount: groupTotal,
    });
  }

  const specials: SpecialData[] = SPECIAL_SECTIONS.map(section => {
    const specialStickers = collection
      .filter(s => s.isSpecial && s.specialAttribute === section.code)
      .sort((a, b) => a.number - b.number);

    const ownedCount = specialStickers.filter(s => isOwned(s)).length;
    totalOwned += ownedCount;

    return {
      code: section.code,
      name: section.name,
      icon: section.icon,
      count: section.count,
      startPosition: 'startPosition' in section ? section.startPosition : undefined,
      stickers: specialStickers,
      ownedCount,
    };
  });

  const totalDuplicates = collection.reduce((sum, s) => sum + s.duplicateCount, 0);

  return {
    groups,
    specials,
    totalOwned,
    totalCount: TOTAL_STICKERS,
    totalDuplicates,
  };
}

export function useTracker() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: defaultAccount } = useCurrentAccount(user?.id);
  const accountId = defaultAccount?.id || '';

  const {
    collection,
    isLoading: collectionLoading,
    addSticker: addStickerMutation,
    removeSticker: removeStickerMutation,
    incrementDuplicate: incrementDuplicateMutation,
    removeDuplicate: removeDuplicateMutation,
  } = useCollection(accountId, ALBUM_ID);

  const teamsQuery = useQuery<TeamInfo[]>({
    queryKey: ['tracker-teams', ALBUM_ID],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      const data = await res.json();
      return data.teams || [];
    },
    enabled: !!accountId,
  });

  const userId = user?.id;

  const pendingQueue = useRef<Array<{ type: 'add' | 'remove'; stickerId: string }>>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toggleVersion, setToggleVersion] = useState(0);
  const localToggles = useRef<Set<string>>(new Set());

  const flushQueue = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    const queue = pendingQueue.current;
    pendingQueue.current = [];
    localToggles.current = new Set();
    setToggleVersion(v => v + 1);

    // Deduplicate: compute net action per sticker.
    // If the same sticker has both add and remove in the queue,
    // only the surplus action is sent. Net zero = skip entirely.
    const netActions = new Map<string, number>();
    for (const item of queue) {
      const current = netActions.get(item.stickerId) ?? 0;
      netActions.set(item.stickerId, current + (item.type === 'add' ? 1 : -1));
    }

    for (const [stickerId, net] of netActions) {
      if (net > 0) {
        addStickerMutation({ stickerId, userId: userId! });
      } else if (net < 0) {
        removeStickerMutation({ stickerId, userId: userId! });
      }
      // net === 0 → skip, no net change to persist
    }
  }, [addStickerMutation, removeStickerMutation, userId]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      flushQueue();
    };
  }, [flushQueue]);

  const enqueue = useCallback((type: 'add' | 'remove', stickerId: string) => {
    pendingQueue.current.push({ type, stickerId });
    localToggles.current.add(stickerId);
    setToggleVersion(v => v + 1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flushQueue, DEBOUNCE_MS);
  }, [flushQueue]);

  const isLoading = authLoading || collectionLoading || teamsQuery.isLoading;

  const data = useMemo(() => {
    if (collection.length > 0 && teamsQuery.data) {
      return buildTrackerData(collection, teamsQuery.data, localToggles.current);
    }
    return null;
  }, [collection, teamsQuery.data, toggleVersion]);

  const ownedSet = useMemo(() => {
    const base = new Set(collection.filter(s => s.state !== 'missing').map(s => s.id));
    for (const id of localToggles.current) {
      if (base.has(id)) base.delete(id);
      else base.add(id);
    }
    return base;
  }, [collection, toggleVersion]);

  return {
    data,
    isLoading,
    collection,
    addSticker: (stickerId: string) => {
      enqueue('add', stickerId);
    },
    removeSticker: (stickerId: string) => {
      enqueue('remove', stickerId);
    },
    incrementDuplicate: (stickerId: string) => {
      incrementDuplicateMutation({ stickerId, userId: userId! });
    },
    removeDuplicate: (stickerId: string) => {
      removeDuplicateMutation({ stickerId, userId: userId! });
    },
    ownedSet,
  };
}
