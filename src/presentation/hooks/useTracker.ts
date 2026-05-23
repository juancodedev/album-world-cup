'use client';

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
  stickers: StickerDTO[];
  ownedCount: number;
}

interface TrackerData {
  groups: GroupData[];
  specials: SpecialData[];
  totalOwned: number;
  totalCount: number;
}

const ALBUM_ID = '00000000-0000-0000-0000-000000000001';

function buildTrackerData(collection: StickerDTO[], teams: TeamInfo[]): TrackerData {
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
      const stickers = collection
        .filter(s => s.teamId === team.id)
        .sort((a, b) => a.number - b.number);

      const ownedCount = stickers.filter(s => s.state !== 'missing').length;
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

    const ownedCount = specialStickers.filter(s => s.state !== 'missing').length;
    totalOwned += ownedCount;

    return {
      code: section.code,
      name: section.name,
      icon: section.icon,
      count: section.count,
      stickers: specialStickers,
      ownedCount,
    };
  });

  return {
    groups,
    specials,
    totalOwned,
    totalCount: TOTAL_STICKERS,
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

  const isLoading = authLoading || collectionLoading || teamsQuery.isLoading;

  let data: TrackerData | null = null;
  if (collection.length > 0 && teamsQuery.data) {
    data = buildTrackerData(collection, teamsQuery.data);
  }

  return {
    data,
    isLoading,
    collection,
    addSticker: (stickerId: string) => {
      addStickerMutation({ stickerId, userId: user!.id });
    },
    removeSticker: (stickerId: string) => {
      removeStickerMutation({ stickerId, userId: user!.id });
    },
    ownedSet: new Set(collection.filter(s => s.state !== 'missing').map(s => s.id)),
  };
}
