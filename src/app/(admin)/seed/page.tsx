'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Confederation {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface Team {
  id: string;
  name: string;
  code: string;
  group_stage: string | null;
  confederation: { name: string; color: string };
  players?: Player[];
}

interface Player {
  id: string;
  team_id: string;
  name: string;
  position: string;
  jersey_number: number | null;
}

interface Sticker {
  id: string;
  number: number;
  rarity: string;
  is_special: boolean;
  team: { name: string; code: string } | null;
  player: { name: string; position: string } | null;
}

interface StickerType {
  id: string;
  code: string;
  name: string;
}

type Tab = 'teams' | 'players' | 'stickers';

const POSITIONS = [
  { value: 'GK', label: 'Portero' },
  { value: 'DF', label: 'Defensa' },
  { value: 'MF', label: 'Mediocampista' },
  { value: 'FW', label: 'Delantero' },
];

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function SeedPage() {
  const [tab, setTab] = useState<Tab>('teams');
  const [confederations, setConfederations] = useState<Confederation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [stickerTypes, setStickerTypes] = useState<StickerType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [teamsRes, stickersRes] = await Promise.all([
      fetch('/seed/api/teams').then(r => r.json()),
      fetch('/seed/api/stickers').then(r => r.json()),
    ]);
    setConfederations(teamsRes.confederations || []);
    setTeams(teamsRes.teams || []);
    setStickers(stickersRes.stickers || []);
    setStickerTypes(stickersRes.types || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin — Seed Data</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(['teams', 'players', 'stickers'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'teams' && '🏆 Equipos'}
            {t === 'players' && '👥 Jugadores'}
            {t === 'stickers' && '🃏 Láminas'}
          </button>
        ))}
      </div>

      {tab === 'teams' && (
        <TeamForm
          confederations={confederations}
          teams={teams}
          onSuccess={fetchData}
        />
      )}

      {tab === 'players' && (
        <PlayerForm teams={teams} onSuccess={fetchData} />
      )}

      {tab === 'stickers' && (
        <StickerPanel
          teams={teams}
          stickers={stickers}
          stickerTypes={stickerTypes}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

function TeamForm({ confederations, teams, onSuccess }: {
  confederations: Confederation[];
  teams: Team[];
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [confedId, setConfedId] = useState('');
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !confedId) return;
    setLoading(true);
    try {
      const res = await fetch('/seed/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, confederation_id: confedId, group_stage: group || null }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`${name} creado`);
        setName(''); setCode(''); setGroup('');
        onSuccess();
      }
    } catch { toast.error('Error al crear equipo'); }
    finally { setLoading(false); }
  };

  const confederationColors: Record<string, string> = {
    CONMEBOL: 'bg-green-100 text-green-800',
    UEFA: 'bg-blue-100 text-blue-800',
    CONCACAF: 'bg-yellow-100 text-yellow-800',
    CAF: 'bg-red-100 text-red-800',
    AFC: 'bg-purple-100 text-purple-800',
    OFC: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Agregar Equipo</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
              placeholder="Ej: Argentina"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm uppercase"
              placeholder="Ej: ARG"
              maxLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confederación</label>
            <select
              value={confedId}
              onChange={e => setConfedId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">Seleccionar...</option>
              {confederations.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select
              value={group}
              onChange={e => setGroup(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">Sin grupo</option>
              {GROUPS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !name || !code || !confedId}
            className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Equipo'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Equipos ({teams.length})</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-gray-500">No hay equipos aún</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {teams.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div>
                  <span className="font-medium text-sm">{t.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{t.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  {t.group_stage && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Grupo {t.group_stage}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${confederationColors[t.confederation?.name] || 'bg-gray-100'}`}>
                    {t.confederation?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerForm({ teams, onSuccess }: { teams: Team[]; onSuccess: () => void }) {
  const [teamId, setTeamId] = useState('');
  const [playersList, setPlayersList] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [jersey, setJersey] = useState('');

  const loadPlayers = async (tid: string) => {
    if (!tid) { setPlayersList([]); return; }
    const res = await fetch(`/seed/api/teams`).then(r => r.json());
    const team = (res.teams || []).find((t: Team) => t.id === tid);
    if (team) setPlayersList(team.players || []);
    else setPlayersList([]);
  };

  const handleTeamChange = (tid: string) => {
    setTeamId(tid);
    loadPlayers(tid);
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !name || !position) return;
    setLoading(true);
    try {
      const res = await fetch('/seed/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, name, position, jersey_number: jersey ? parseInt(jersey) : null }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else { toast.success(`${name} agregado`); setName(''); setJersey(''); loadPlayers(teamId); }
    } catch { toast.error('Error al agregar jugador'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Agregar Jugador</h2>
        <form onSubmit={handleAddPlayer} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
            <select
              value={teamId}
              onChange={e => handleTeamChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">Seleccionar...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del jugador</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
              placeholder="Ej: Lionel Messi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">Seleccionar...</option>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dorsal</label>
              <input
                value={jersey}
                onChange={e => setJersey(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                placeholder="Ej: 10"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !teamId || !name || !position}
            className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Agregando...' : 'Agregar Jugador'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">
          Jugadores {teamId ? `- ${teams.find(t => t.id === teamId)?.name}` : ''}
        </h2>
        {!teamId ? (
          <p className="text-sm text-gray-500">Selecciona un equipo</p>
        ) : playersList.length === 0 ? (
          <p className="text-sm text-gray-500">Sin jugadores aún</p>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {playersList.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                <span className="font-medium">{p.name}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{POSITIONS.find(pos => pos.value === p.position)?.label || p.position}</span>
                  {p.jersey_number && <span className="bg-gray-200 px-1.5 py-0.5 rounded">#{p.jersey_number}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StickerPanel({ teams, stickers, stickerTypes, onSuccess }: {
  teams: Team[];
  stickers: Sticker[];
  stickerTypes: StickerType[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  const teamStickers = selectedTeam
    ? stickers.filter(s => s.team?.name === teams.find(t => t.id === selectedTeam)?.name)
    : stickers;

  const generateForTeam = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    try {
      const res = await fetch('/seed/api/stickers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: selectedTeam }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else { toast.success(`${data.count} láminas generadas`); onSuccess(); }
    } catch { toast.error('Error al generar'); }
    finally { setLoading(false); }
  };

  const deleteSticker = async (id: string) => {
    await fetch(`/seed/api/stickers?id=${id}`, { method: 'DELETE' });
    onSuccess();
  };

  const rarityColors: Record<string, string> = {
    common: 'bg-gray-100 text-gray-700',
    rare: 'bg-blue-100 text-blue-700',
    legendary: 'bg-yellow-100 text-yellow-700',
    holographic: 'bg-purple-100 text-purple-700',
    limited: 'bg-red-100 text-red-700',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Generar Láminas</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">Seleccionar...</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code}) — {stickers.filter(s => s.team?.name === t.name).length} láminas
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generateForTeam}
            disabled={loading || !selectedTeam}
            className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generando...' : 'Generar láminas desde jugadores'}
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tipos de lámina disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {stickerTypes.map(t => (
              <span key={t.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{t.name} ({t.code})</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Láminas {selectedTeam ? `- ${teams.find(t => t.id === selectedTeam)?.name}` : ''}
            <span className="text-gray-500 font-normal ml-2">({teamStickers.length})</span>
          </h2>
          {stickers.length > 0 && (
            <span className="text-xs text-gray-400">Total: {stickers.length}</span>
          )}
        </div>
        {teamStickers.length === 0 ? (
          <p className="text-sm text-gray-500">Sin láminas. Selecciona un equipo y genera.</p>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {teamStickers.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">#{s.number}</span>
                  <span className="font-medium">{s.player?.name || s.team?.name}</span>
                  {s.player && <span className="text-xs text-gray-400">{s.player.position}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${rarityColors[s.rarity] || 'bg-gray-100'}`}>
                    {s.rarity}
                  </span>
                  <button
                    onClick={() => deleteSticker(s.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
