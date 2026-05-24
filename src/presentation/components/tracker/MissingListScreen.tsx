'use client';

import Link from 'next/link';
import { GroupData, SpecialData, TrackerTeam } from '../../hooks/useTracker';
import { GROUP_COLORS, STICKERS_PER_TEAM } from '../../../shared/constants/tracker.constants';
import { ChevronLeft } from 'lucide-react';

interface MissingListScreenProps {
  groups: GroupData[];
  specials: SpecialData[];
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
}

interface TeamWithMissing extends TrackerTeam {
  missing: { id: string; code: string }[];
}

interface SectionWithMissing extends SpecialData {
  missing: { id: string; code: string }[];
}

function getMissingGroupTeams(groups: GroupData[]) {
  return groups
    .map(g => ({
      ...g,
      teams: g.teams
        .map(t => {
          const missing: { id: string; code: string }[] = [];
          for (let pos = 1; pos <= STICKERS_PER_TEAM; pos++) {
            const sticker = t.stickers.find(
              s => (s.number % STICKERS_PER_TEAM === pos % STICKERS_PER_TEAM)
            );
            if (sticker && sticker.state === 'missing') {
              missing.push({ id: sticker.id, code: `${t.code}${pos}` });
            }
          }
          return missing.length > 0 ? { ...t, missing } : null;
        })
        .filter(Boolean) as TeamWithMissing[],
    }))
    .filter(g => g.teams.length > 0) as {
    id: string; teams: TeamWithMissing[]; totalOwned: number; totalCount: number;
  }[];
}

function getMissingSpecials(specials: SpecialData[]) {
  return specials
    .map(s => {
      const missing: { id: string; code: string }[] = [];
      for (let pos = 1; pos <= s.count; pos++) {
        const sticker = s.stickers.find((_, i) => i + 1 === pos);
        if (sticker && sticker.state === 'missing') {
          missing.push({ id: sticker.id, code: `${s.code}${pos}` });
        }
      }
      return missing.length > 0 ? { ...s, missing } : null;
    })
    .filter(Boolean) as SectionWithMissing[];
}

export function MissingListScreen({ groups, specials, ownedSet: _ownedSet, onToggle }: MissingListScreenProps) {
  const missingGroups = getMissingGroupTeams(groups);
  const missingSpecials = getMissingSpecials(specials);

  const totalMissing = missingGroups.reduce(
    (sum, g) => sum + g.teams.reduce((a, t) => a + t.missing.length, 0),
    0
  ) + missingSpecials.reduce((sum, s) => sum + s.missing.length, 0);

  if (totalMissing === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 mb-1">¡Colección completa!</h2>
        <p className="text-gray-500 text-sm">No tienes stickers faltantes.</p>
        <Link
          href="/tracker"
          className="mt-6 px-6 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 transition-colors"
        >
          Volver al tracker
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/tracker"
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <div className="text-[10px] tracking-[3px] font-bold text-pink-500">LISTADO COMPLETO</div>
          <h1 className="text-lg font-black text-gray-900">Faltantes por equipo y grupo</h1>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black text-pink-500">{totalMissing}</div>
          <div className="text-[10px] text-gray-400 font-medium">faltantes</div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5">
        Tocá un código de sticker para marcarlo como adquirido.
      </p>

      {/* Groups */}
      <div className="space-y-4">
        {missingGroups.map(group => {
          const color = GROUP_COLORS[group.id] || '#6b7280';
          const groupMissing = group.teams.reduce((a, t) => a + t.missing.length, 0);
          return (
            <div key={group.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${color}` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
                    style={{ backgroundColor: color }}
                  >
                    {group.id}
                  </div>
                  <span className="font-bold text-sm text-gray-700">Grupo {group.id}</span>
                </div>
                <span className="text-xs font-bold text-gray-400">{groupMissing} faltantes</span>
              </div>
              <div className="p-3 space-y-2">
                {group.teams.map(team => (
                  <div key={team.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-xl">{team.flag || '🏳️'}</span>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{team.name}</div>
                        <div className="text-xs text-gray-400">
                          {team.code} · {team.missing.length} faltantes
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.missing.map(({ id, code }) => (
                        <button
                          key={id}
                          onClick={() => onToggle(id)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 transition-all active:scale-95"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Special sections */}
      {missingSpecials.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-sm text-amber-700">✨ Especiales</span>
          </div>
          <div className="p-3 space-y-2">
            {missingSpecials.map(section => (
              <div key={section.code} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-semibold text-sm text-gray-900">{section.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {section.missing.length} faltantes
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {section.missing.map(({ id, code }) => (
                    <button
                      key={id}
                      onClick={() => onToggle(id)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all active:scale-95"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
