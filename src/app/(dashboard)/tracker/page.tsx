'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useTracker } from '../../../presentation/hooks/useTracker';
import { GroupCard } from '../../../presentation/components/tracker/GroupCard';
import { SpecialCard } from '../../../presentation/components/tracker/SpecialCard';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import Link from 'next/link';
import { Progress } from '../../../components/ui/progress';
import { GROUP_ORDER } from '../../../shared/constants/tracker.constants';
import { GROUP_COLORS } from '../../../shared/constants/tracker.constants';

export default function TrackerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, addSticker, removeSticker, ownedSet } = useTracker();
  const [tab, setTab] = useState<'grupos' | 'especial'>('grupos');
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('Todos');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const filteredGroups = useMemo(() => {
    if (!data) return [];
    return data.groups.filter(g => {
      if (activeGroup !== 'Todos' && g.id !== activeGroup) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return g.teams.some(t =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
      );
    });
  }, [data, search, activeGroup]);

  if (authLoading || !user) return null;

  const pct = data ? Math.round((data.totalOwned / data.totalCount) * 100) : 0;
  const missing = data ? data.totalCount - data.totalOwned : 0;

  const handleToggle = (stickerId: string) => {
    if (ownedSet.has(stickerId)) {
      removeSticker(stickerId);
    } else {
      addSticker(stickerId);
    }
  };

  const handleMarkAllTeam = (teamId: string, stickerIds: string[]) => {
    stickerIds.forEach(id => {
      if (!ownedSet.has(id)) addSticker(id);
    });
  };

  const handleClearAllTeam = (teamId: string, stickerIds: string[]) => {
    stickerIds.forEach(id => {
      if (ownedSet.has(id)) removeSticker(id);
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-5 text-white">
          <div className="text-[10px] tracking-[3px] font-bold opacity-70 mb-1">ÁLBUM PANINI</div>
          <h1 className="text-xl font-black mb-1">
            FIFA WORLD CUP <span className="text-yellow-300">2026</span>
          </h1>
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-3xl font-black text-pink-300">{pct}%</div>
              <div className="flex items-center gap-3">
                <Link
                  href="/tracker/missing"
                  className="text-xs font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200 transition-colors"
                >
                  ⚡ {missing} faltantes
                </Link>
                <Link
                  href="/tracker/ranking"
                  className="text-xs font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200 transition-colors"
                >
                  🏆 Ranking
                </Link>
              </div>
            </div>
            <div className="text-right text-xs opacity-70">
              <div>{data?.totalOwned || 0} / {data?.totalCount || 1005}</div>
              <div>completados</div>
            </div>
          </div>
          <Progress value={pct} className="h-2 bg-white/20 [&>div]:bg-pink-400" />
          <div className="flex gap-3 mt-3 text-xs">
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="font-black text-sm">{data ? data.groups.filter(g =>
                g.teams.every(t => t.ownedCount === 20)
              ).length : '-'}/12</div>
              <div className="opacity-60 text-[10px]">Grupos</div>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="font-black text-sm">{data ? data.groups.flatMap(g => g.teams).filter(t =>
                t.ownedCount === 20
              ).length : '-'}</div>
              <div className="opacity-60 text-[10px]">Equipos</div>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="font-black text-sm">{data?.totalOwned || '-'}</div>
              <div className="opacity-60 text-[10px]">Stickers</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('grupos')}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'grupos' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            ⚽ GRUPOS (A–L)
          </button>
          <button
            onClick={() => setTab('especial')}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'especial' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            ✨ ESPECIALES
          </button>
        </div>

        {tab === 'grupos' && (
          <>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Buscar equipo o código..."
              className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
            />

            {/* Group filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveGroup('Todos')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeGroup === 'Todos' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {GROUP_ORDER.map(gid => {
                const group = data?.groups.find(g => g.id === gid);
                const gpct = group ? Math.round((group.totalOwned / group.totalCount) * 100) : 0;
                const color = GROUP_COLORS[gid];
                return (
                  <button
                    key={gid}
                    onClick={() => setActiveGroup(gid)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center leading-tight ${
                      activeGroup === gid ? 'text-white' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={activeGroup === gid ? { backgroundColor: color } : {}}
                  >
                    <span>Grupo {gid}</span>
                    <span className="text-[9px] opacity-70">{gpct}%</span>
                  </button>
                );
              })}
            </div>

            {/* Group cards */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 rounded-2xl shimmer" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    ownedSet={ownedSet}
                    onToggle={handleToggle}
                    onMarkAllTeam={handleMarkAllTeam}
                    onClearAllTeam={handleClearAllTeam}
                  />
                ))}
                {filteredGroups.length === 0 && (
                  <div className="text-center text-gray-400 py-10">Sin resultados</div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'especial' && (
          <div className="space-y-3">
            {data?.specials.map(section => (
              <SpecialCard
                key={section.code}
                section={section}
                ownedSet={ownedSet}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
