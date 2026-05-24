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
  const { data, isLoading, addSticker, removeSticker, incrementDuplicate, ownedSet } = useTracker();
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
  const totalDuplicates = data?.totalDuplicates || 0;

  const handleToggle = (stickerId: string) => {
    if (ownedSet.has(stickerId)) {
      removeSticker(stickerId);
    } else {
      addSticker(stickerId);
    }
  };

  const handleDuplicate = (stickerId: string) => {
    incrementDuplicate(stickerId);
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
      <div className="space-y-4">
        {/* Header with progress */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-3 sm:p-5 text-white">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="text-[9px] sm:text-[10px] tracking-[3px] font-bold opacity-70">ÁLBUM PANINI</div>
            <div className="text-[10px] sm:text-xs opacity-70 leading-tight text-right">
              {data?.totalOwned || 0}/{data?.totalCount || 1005}
            </div>
          </div>
          <h1 className="text-sm sm:text-xl font-black mb-2 sm:mb-3 leading-tight">
            FIFA WORLD CUP <span className="text-yellow-300">2026</span>
          </h1>
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-4xl font-black text-pink-300">{pct}%</span>
              <Link
                href="/tracker/missing"
                className="text-[11px] sm:text-xs font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200 whitespace-nowrap"
              >
                ⚡ {missing}
              </Link>
              <Link
                href="/tracker/ranking"
                className="text-[11px] sm:text-xs font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200 whitespace-nowrap"
              >
                🏆
              </Link>
              <Link
                href="/tracker/duplicates"
                className="text-[11px] sm:text-xs font-bold text-blue-300 underline underline-offset-2 hover:text-blue-200 whitespace-nowrap"
              >
                🔁 {totalDuplicates}
              </Link>
            </div>
          </div>
          <Progress value={pct} className="h-1.5 sm:h-2 bg-white/20 [&>div]:bg-pink-400" />
          <div className="flex items-center justify-around gap-1 mt-2 sm:mt-3 text-center">
            <div>
              <div className="font-bold text-xs sm:text-sm">{data ? data.groups.filter(g =>
                g.teams.every(t => t.ownedCount === 20)
              ).length : '-'}/12</div>
              <div className="opacity-60 text-[9px] sm:text-[10px]">Grupos</div>
            </div>
            <div className="w-px h-7 sm:h-8 bg-white/20" />
            <div>
              <div className="font-bold text-xs sm:text-sm">{data ? data.groups.flatMap(g => g.teams).filter(t =>
                t.ownedCount === 20
              ).length : '-'}</div>
              <div className="opacity-60 text-[9px] sm:text-[10px]">Equipos</div>
            </div>
            <div className="w-px h-7 sm:h-8 bg-white/20" />
            <div>
              <div className="font-bold text-xs sm:text-sm">{data?.totalOwned || '-'}</div>
              <div className="opacity-60 text-[9px] sm:text-[10px]">Stickers</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('grupos')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'grupos' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            ⚽ GRUPOS (A–L)
          </button>
          <button
            onClick={() => setTab('especial')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
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
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveGroup('Todos')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center leading-tight ${
                      activeGroup === gid ? 'text-white' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={activeGroup === gid ? { backgroundColor: color } : {}}
                  >
                    <span>Grupo {gid}</span>
                    <span className="text-[9px] sm:text-[10px] opacity-70">{gpct}%</span>
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
                    onDuplicate={handleDuplicate}
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
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
