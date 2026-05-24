'use client';

import { GroupData } from '../../hooks/useTracker';
import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { TeamRow } from './TeamRow';
import { Progress } from '../../../components/ui/progress';
import { GROUP_COLORS } from '../../../shared/constants/tracker.constants';

interface GroupCardProps {
  group: GroupData;
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
  onDuplicate?: (stickerId: string) => void;
  onMarkAllTeam: (teamId: string, stickerIds: string[]) => void;
  onClearAllTeam: (teamId: string, stickerIds: string[]) => void;
}

export function GroupCard({ group, ownedSet, onToggle, onDuplicate, onMarkAllTeam, onClearAllTeam }: GroupCardProps) {
  if (!group || !group.teams) return null;
  const color = GROUP_COLORS[group.id] || '#6b7280';
  const pct = group.totalCount > 0 ? Math.round((group.totalOwned / group.totalCount) * 100) : 0;

  function getOwnedStickerIds(stickers: StickerDTO[]): string[] {
    return stickers.filter(s => s.state !== 'missing').map(s => s.id);
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
      <div
        className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4"
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}08)`,
          borderBottom: `2px solid ${color}`,
        }}
      >
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-white text-base sm:text-lg flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {group.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide truncate min-w-0 mr-2" style={{ color: `${color}cc` }}>
              Grupo {group.id}
            </span>
            <span className="text-base sm:text-lg font-black flex-shrink-0" style={{ color }}>
              {pct}%
            </span>
          </div>
          <Progress value={pct} className="h-1 sm:h-1.5" style={{ backgroundColor: `${color}20` }} />
          <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 block">
            {group.totalOwned}/{group.totalCount} stickers
          </span>
        </div>
      </div>

      <div className="p-1.5 sm:p-2 space-y-1.5 sm:space-y-2">
        {group.teams.map(team => (
          <TeamRow
            key={team.id}
            code={team.code}
            name={team.name}
            flag={team.flag}
            stickers={team.stickers}
            ownedCount={team.ownedCount}
            groupColor={color}
            ownedSet={ownedSet}
            onToggle={onToggle}
            onDuplicate={onDuplicate}
            onMarkAll={() => onMarkAllTeam(team.id, team.stickers.map(s => s.id))}
            onClearAll={() => onClearAllTeam(team.id, getOwnedStickerIds(team.stickers))}
          />
        ))}
      </div>
    </div>
  );
}
