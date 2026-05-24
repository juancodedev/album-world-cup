'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useTracker } from '../../../presentation/hooks/useTracker';
import { GroupCard } from '../../../presentation/components/tracker/GroupCard';
import { SpecialCard } from '../../../presentation/components/tracker/SpecialCard';
import { CircularProgress } from '../../../presentation/components/tracker/CircularProgress';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
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
        {/* Header card with progress */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] sm:text-[10px] tracking-[3px] font-bold opacity-70">ÁLBUM PANINI</div>
            <div className="text-[10px] sm:text-xs opacity-70 leading-tight text-right font-mono">
              {data?.totalOwned || 0}/{data?.totalCount || 1005}
            </div>
          </div>
          <h1 className="text-base sm:text-2xl font-black mb-3 sm:mb-4 leading-tight">
            FIFA WORLD CUP <span className="text-amber-400">2026</span>
          </h1>
          <div className="flex justify-start mb-3 sm:mb-4">
            <CircularProgress value={pct} size={120} strokeWidth={7} />
          </div>
          <Progress value={pct} className="h-1.5 sm:h-2 bg-white/20" />
          <div className="flex items-center justify-around gap-1 mt-3 sm:mt-4 text-center">
            <div>
              <div className="font-bold text-xs sm:text-base">{data ? data.groups.filter(g =>
                g.teams.every(t => t.ownedCount === 20)
              ).length : '-'}/12</div>
              <div className="opacity-70 text-[9px] sm:text-[10px] font-medium">Grupos</div>
            </div>
            <div className="w-px h-8 sm:h-10 bg-white/20" />
            <div>
              <div className="font-bold text-xs sm:text-base">{data ? data.groups.flatMap(g => g.teams).filter(t =>
                t.ownedCount === 20
              ).length : '-'}</div>
              <div className="opacity-70 text-[9px] sm:text-[10px] font-medium">Equipos</div>
            </div>
            <div className="w-px h-8 sm:h-10 bg-white/20" />
            <div>
              <div className="font-bold text-xs sm:text-base">{data?.totalOwned || '-'}</div>
              <div className="opacity-70 text-[9px] sm:text-[10px] font-medium">Stickers</div>
            </div>
            <div className="w-px h-8 sm:h-10 bg-white/20" />
            <div>
              <div className="font-bold text-xs sm:text-base">{missing}</div>
              <div className="opacity-70 text-[9px] sm:text-[10px] font-medium">Faltantes</div>
            </div>
            <div className="w-px h-8 sm:h-10 bg-white/20" />
            <div>
              <div className="font-bold text-xs sm:text-base">{totalDuplicates}</div>
              <div className="opacity-70 text-[9px] sm:text-[10px] font-medium">Repetidas</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('grupos')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'grupos' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            ⚽ GRUPOS (A–L)
          </button>
          <button
            onClick={() => setTab('especial')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'especial' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
              className="w-full h-11 px-5 rounded-full border-0 text-sm bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />

            {/* Group filter pills */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveGroup('Todos')}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeGroup === 'Todos' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                      activeGroup === gid ? 'text-white shadow-sm' : 'text-muted-foreground bg-muted hover:bg-muted/80'
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
