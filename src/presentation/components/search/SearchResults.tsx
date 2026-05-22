'use client';

import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { PlayerDTO } from '../../../application/dtos/player.dto';
import { TeamDTO } from '../../../application/dtos/team.dto';
import { StickerCard } from '../stickers/StickerCard';
import { EmptyState } from '../common/EmptyState';

interface SearchResultsProps {
  stickers: StickerDTO[];
  players: PlayerDTO[];
  teams: TeamDTO[];
  isSearching: boolean;
  query: string;
  onStickerClick?: (id: string) => void;
}

export function SearchResults({
  stickers,
  players,
  teams,
  isSearching,
  query,
  onStickerClick,
}: SearchResultsProps) {
  if (!isSearching) return null;

  const hasResults = stickers.length > 0 || players.length > 0 || teams.length > 0;

  if (!hasResults) {
    return (
      <EmptyState
        icon="🔍"
        title="Sin resultados"
        description={`No encontramos nada para "${query}"`}
      />
    );
  }

  return (
    <div className="space-y-6">
      {stickers.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Láminas ({stickers.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                {...sticker}
                onClick={() => onStickerClick?.(sticker.id)}
              />
            ))}
          </div>
        </section>
      )}

      {players.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Jugadores ({players.length})
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{player.name}</p>
                  <p className="text-xs text-gray-500">{player.teamName} · {player.position}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Selecciones ({teams.length})
          </h3>
          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <span className="text-2xl">{team.flagUrl || '🏳️'}</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">{team.name}</p>
                  <p className="text-xs text-gray-500">{team.confederationName}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
