'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { Plus, Search, X } from 'lucide-react';
import { SPECIAL_SECTIONS, STICKERS_PER_TEAM } from '../../../shared/constants/tracker.constants';

const TEAM_TOTAL = 48 * STICKERS_PER_TEAM;

const specialRanges = (() => {
  let offset = TEAM_TOTAL + 1;
  return SPECIAL_SECTIONS.map(sec => ({
    attribute: sec.code,
    displayCode: ('displayCode' in sec ? (sec as { displayCode?: string }).displayCode : undefined) ?? sec.code,
    startGlobal: offset,
    count: sec.count,
    startPosition: (sec as { startPosition?: number }).startPosition ?? 1,
    _end: (offset += sec.count) - sec.count,
  }));
})();

function formatSpecialCode(specialAttribute: string, globalNumber: number): string {
  const r = specialRanges.find(s => s.attribute === specialAttribute);
  if (!r) return `#${globalNumber}`;
  const localPos = (globalNumber - r.startGlobal) + r.startPosition;
  return `${r.displayCode}${localPos === 0 ? '00' : String(localPos)}`;
}

interface DuplicateEntry {
  stickerId: string;
  teamId: string;
  code: string;
  teamName: string;
  teamFlag: string | null;
  count: number;
  image: string | null;
}

interface TeamInfo {
  code: string;
  name: string;
  flag: string | null;
}

interface CreateExchangeDialogProps {
  userId: string;
  accountId: string;
  collection: StickerDTO[];
  duplicates: DuplicateEntry[];
  teamInfoMap: Map<string, TeamInfo>;
  onCreateOffer: (input: {
    offeredStickerId: string;
    requestedStickerId?: string;
    message?: string;
  }) => void;
  isPending: boolean;
}

export function CreateExchangeDialog({
  userId: _userId,
  accountId: _accountId,
  collection,
  duplicates,
  teamInfoMap,
  onCreateOffer,
  isPending,
}: CreateExchangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [offeredStickerId, setOfferedStickerId] = useState('');
  const [requestedStickerId, setRequestedStickerId] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Global number → local per-team position (1-20)
  const localNumber = (globalNum: number) => ((globalNum - 1) % STICKERS_PER_TEAM) + 1;

  // Resolve team info for a sticker by teamId
  const getTeamInfo = (teamId: string | null | undefined): TeamInfo | null => {
    if (!teamId) return null;
    return teamInfoMap.get(teamId) ?? null;
  };

  // Build sticker code: e.g. "ARG5"
  const buildStickerCode = (sticker: { teamId: string | null; number: number; specialAttribute: string | null }): string => {
    const team = getTeamInfo(sticker.teamId);
    if (team) {
      const local = localNumber(sticker.number);
      return `${team.code}${local}`;
    }
    if (sticker.specialAttribute) {
      return formatSpecialCode(sticker.specialAttribute, sticker.number);
    }
    return `#${sticker.number}`;
  };

  // Group duplicates by team
  const duplicatesByTeam = useMemo(() => {
    const groups = new Map<string, { teamName: string; teamFlag: string | null; stickers: DuplicateEntry[] }>();

    for (const d of duplicates) {
      const key = d.teamId || '__no_team__';
      if (!groups.has(key)) {
        groups.set(key, {
          teamName: d.teamName || 'Otros',
          teamFlag: d.teamFlag || null,
          stickers: [],
        });
      }
      groups.get(key)!.stickers.push(d);
    }

    return Array.from(groups.values()).sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [duplicates]);

  // Other stickers available for requesting (grouped by team, with search)
  const otherStickersByTeam = useMemo(() => {
    const available = collection.filter(
      s => s.state === 'missing' && s.id !== offeredStickerId
    );

    // Resolve sticker codes and team info
    const withInfo = available.map(s => {
      const team = getTeamInfo(s.teamId);
      return {
        ...s,
        stickerCode: buildStickerCode(s),
        teamName: team?.name || s.teamName || '',
        teamFlag: team?.flag || null,
      };
    });

    // Filter by search
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? withInfo.filter(s =>
          s.stickerCode.toLowerCase().includes(q) ||
          s.teamName.toLowerCase().includes(q)
        )
      : withInfo;

    // Group by team
    const groups = new Map<string, { teamName: string; teamFlag: string | null; stickers: typeof filtered }>();
    for (const s of filtered) {
      const key = s.teamId || '__no_team__';
      if (!groups.has(key)) {
        groups.set(key, {
          teamName: s.teamName || 'Otros',
          teamFlag: s.teamFlag || null,
          stickers: [],
        });
      }
      groups.get(key)!.stickers.push(s);
    }

    return Array.from(groups.values()).sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [collection, offeredStickerId, teamInfoMap, searchQuery]);

  const handleSubmit = () => {
    if (!offeredStickerId) return;
    onCreateOffer({
      offeredStickerId,
      requestedStickerId: requestedStickerId || undefined,
      message: message || undefined,
    });
    setOpen(false);
    setOfferedStickerId('');
    setRequestedStickerId('');
    setMessage('');
    setSearchQuery('');
  };

  const selectedOffer = duplicates.find(d => d.stickerId === offeredStickerId);
  const selectedRequest = requestedStickerId
    ? collection.find(s => s.id === requestedStickerId)
    : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSearchQuery('');
      }
      setOpen(isOpen);
    }}>
      <DialogTrigger render={<Button className="font-bold gap-2">
        <Plus className="w-4 h-4" />
        Nueva oferta
      </Button>} />

      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear oferta de intercambio</DialogTitle>
          <DialogDescription>
            Ofrece un sticker repetido y elige cuál quieres a cambio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ───── YO DOY ───── */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">✓</span>
              YO DOY (repetido)
            </label>

            {duplicatesByTeam.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">
                No tienes stickers repetidos para ofrecer.
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto p-1">
                {duplicatesByTeam.map(group => (
                  <div key={group.teamName}>
                    <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                      {group.teamFlag && <span className="text-sm">{group.teamFlag}</span>}
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {group.teamName}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                      {group.stickers.map(d => {
                        const isSelected = offeredStickerId === d.stickerId;
                        return (
                          <button
                            key={d.stickerId}
                            onClick={() => setOfferedStickerId(d.stickerId)}
                            className={`
                              aspect-[3/4] rounded-lg relative overflow-hidden transition-all duration-150 flex flex-col items-center justify-center gap-0.5
                              ${isSelected
                                ? 'ring-2 ring-green-500 ring-offset-1 bg-gradient-to-b from-green-50 to-green-100'
                                : 'bg-gray-50 border border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                              }
                            `}
                          >
                            <span className={`font-bold text-[10px] leading-tight text-center px-0.5 ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>
                              {d.code}
                            </span>
                            {/* Count badge */}
                            <div className={`text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                              {d.count}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ───── YO QUIERO ───── */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">?</span>
              YO QUIERO (opcional — si no eliges, regalas el sticker)
            </label>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por país o código (ej: ARG, BRA5)..."
                className="w-full h-9 pl-9 pr-8 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Stickers grid grouped by team */}
            <div className="max-h-56 overflow-y-auto p-1 space-y-3">
              {/* Single "Regalar" option at the top */}
              <button
                onClick={() => {
                  setRequestedStickerId('');
                  setSearchQuery('');
                }}
                className={`
                  w-full rounded-lg flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all border
                  ${!requestedStickerId
                    ? 'ring-2 ring-primary ring-offset-1 bg-primary/10 border-primary/30'
                    : 'bg-gray-50 border-dashed border-gray-200 hover:border-primary/30'
                  }
                `}
              >
                <span className="text-lg">—</span>
                <span>Regalar (sin intercambio)</span>
              </button>

              {otherStickersByTeam.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  {searchQuery ? 'Sin resultados para esta búsqueda' : 'No hay stickers disponibles'}
                </div>
              ) : (
                otherStickersByTeam.map(group => (
                  <div key={group.teamName}>
                    <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                      {group.teamFlag && <span className="text-sm">{group.teamFlag}</span>}
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {group.teamName}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {group.stickers.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                      {group.stickers.map(s => {
                        const isSelected = requestedStickerId === s.id;
                        const stickerCode = buildStickerCode(s);
                        return (
                          <button
                            key={s.id}
                            onClick={() => setRequestedStickerId(s.id)}
                            className={`
                              aspect-[3/4] rounded-lg relative overflow-hidden transition-all duration-150
                              ${isSelected
                                ? 'ring-2 ring-amber-500 ring-offset-1 bg-gradient-to-b from-amber-50 to-amber-100'
                                : 'bg-gray-50 border border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                              }
                            `}
                          >
                            {s.imageThumbnail ? (
                              <img src={s.imageThumbnail} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className={`font-bold text-[10px] leading-tight text-center px-0.5 ${isSelected ? 'text-amber-700' : 'text-gray-400'}`}>
                                  {stickerCode}
                                </span>
                              </div>
                            )}
                            {/* Code overlay on image */}
                            {s.imageThumbnail && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-0.5 py-0.5">
                                <span className="text-[8px] font-bold text-white block text-center leading-tight">
                                  {stickerCode}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Optional message */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground tracking-wide">
              MENSAJE (opcional)
            </label>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ej: Cambio esta por cualquiera de Argentina..."
              className="w-full h-10 px-3 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/30"
              maxLength={200}
            />
          </div>

          {/* Preview */}
          {selectedOffer && (
            <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">Ofreces</div>
                <div className="font-bold text-sm font-mono">{selectedOffer.code}</div>
                <div className="text-[10px] text-muted-foreground">x{selectedOffer.count}</div>
              </div>
              <span className="text-xl">⇄</span>
              <div className="flex-1 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">Recibes</div>
                {selectedRequest ? (
                  <div className="font-bold text-sm font-mono">
                    {buildStickerCode(selectedRequest)}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!offeredStickerId || isPending}
            className="flex-1 font-bold"
          >
            {isPending ? 'Creando...' : 'Publicar oferta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
