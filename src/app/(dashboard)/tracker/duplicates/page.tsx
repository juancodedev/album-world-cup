'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../presentation/providers/AuthProvider';
import { useTracker } from '../../../../presentation/hooks/useTracker';
import { DashboardLayout } from '../../../../presentation/layouts/DashboardLayout';
import { ChevronLeft, Plus, Minus } from 'lucide-react';
import { GROUP_COLORS, GROUP_ORDER, STICKERS_PER_TEAM } from '../../../../shared/constants/tracker.constants';
import { FLAG_EMOJI } from '../../../../shared/constants/flags.constants';

interface DuplicateEntry {
  id: string;
  code: string;
  count: number;
}

interface TeamDuplicates {
  teamId: string;
  code: string;
  name: string;
  flag: string | null;
  groupId: string;
  duplicates: DuplicateEntry[];
}

export default function DuplicatesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data, collection, isLoading, incrementDuplicate, removeDuplicate } = useTracker();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const teamsById = useMemo(() => {
    if (!data) return new Map<string, { code: string; name: string; flag: string | null; groupId: string }>();
    const map = new Map<string, { code: string; name: string; flag: string | null; groupId: string }>();
    for (const group of data.groups) {
      for (const team of group.teams) {
        map.set(team.id, { code: team.code, name: team.name, flag: team.flag, groupId: group.id });
      }
    }
    return map;
  }, [data]);

  const teamDuplicates = useMemo(() => {
    if (!data) return [];

    const dupMap = new Map<string, DuplicateEntry[]>();
    const teamStickerPositions = new Map<string, number>();

    for (const group of data.groups) {
      for (const team of group.teams) {
        teamStickerPositions.clear();
        team.stickers
          .filter(s => s.duplicateCount > 0)
          .forEach(s => {
            const idx = team.stickers.indexOf(s);
            const pos = idx !== -1 ? idx + 1 : ((s.number - 1) % STICKERS_PER_TEAM) + 1;
            const entry: DuplicateEntry = { id: s.id, code: pos.toString(), count: s.duplicateCount };
            const list = dupMap.get(team.id) || [];
            list.push(entry);
            dupMap.set(team.id, list);
          });
      }
    }

    const result: TeamDuplicates[] = [];
    for (const [teamId, duplicates] of dupMap.entries()) {
      const info = teamsById.get(teamId);
      if (!info) continue;
      result.push({
        teamId,
        code: info.code,
        name: info.name,
        flag: info.flag,
        groupId: info.groupId,
        duplicates,
      });
    }

    result.sort((a, b) => {
      const gi = GROUP_ORDER.indexOf(a.groupId) - GROUP_ORDER.indexOf(b.groupId);
      if (gi !== 0) return gi;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [data, teamsById]);

  const totalDuplicates = collection.reduce((sum, s) => sum + s.duplicateCount, 0);

  if (authLoading || !user) return null;

  const handleIncrement = (stickerId: string) => {
    incrementDuplicate(stickerId);
  };

  const handleDecrement = (stickerId: string) => {
    removeDuplicate(stickerId);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/tracker"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="text-[10px] tracking-[3px] font-bold text-blue-500">GESTIÓN</div>
            <h1 className="text-lg font-black text-gray-900">Stickers repetidos</h1>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-black text-blue-500">{totalDuplicates}</div>
            <div className="text-[10px] text-gray-400 font-medium">repetidos</div>
          </div>
        </div>

        {teamDuplicates.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
            <span className="text-6xl mb-4">📭</span>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sin repetidas</h2>
            <p className="text-gray-500 text-sm">
              Hacé doble clic en una figurita del tracker para marcarla como repetida.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {GROUP_ORDER.map(groupId => {
              const groupTeams = teamDuplicates.filter(t => t.groupId === groupId);
              if (groupTeams.length === 0) return null;
              const color = GROUP_COLORS[groupId] || '#6b7280';
              const groupDups = groupTeams.reduce((sum, t) => sum + t.duplicates.reduce((a, d) => a + d.count, 0), 0);
              return (
                <div key={groupId} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ borderBottom: `2px solid ${color}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {groupId}
                    </div>
                    <span className="font-bold text-sm text-gray-700">Grupo {groupId}</span>
                    <span className="ml-auto text-xs font-bold text-gray-400">{groupDups} repetidos</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {groupTeams.map(td => (
                      <div key={td.teamId} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="text-xl">{FLAG_EMOJI[td.code] || td.flag || '🏳️'}</span>
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{td.name}</div>
                            <div className="text-xs text-gray-400">{td.code}</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {td.duplicates.map(d => (
                            <div
                              key={d.id}
                              className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {d.code}
                              </div>
                              <span className="font-mono font-bold text-sm text-gray-900 flex-1">
                                {td.code}{d.code}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDecrement(d.id)}
                                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-7 text-center font-bold text-sm text-gray-900">
                                  {d.count}
                                </span>
                                <button
                                  onClick={() => handleIncrement(d.id)}
                                  className="w-7 h-7 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 transition-colors flex items-center justify-center"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
