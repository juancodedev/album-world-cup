'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

interface Team {
  id: string;
  name: string;
  code: string;
}

interface Sticker {
  id: string;
  code: string;
  team: { name: string; code: string } | null;
  category: { name: string; code: string } | null;
  player_nombre: string | null;
  player_apellido: string | null;
  player_fecha_nacimiento: string | null;
  player_estatura: number | null;
  player_peso: number | null;
  player_club_actual: string | null;
  player_pais_club: string | null;
}

type Tab = 'categories' | 'teams' | 'stickers';

export default function SeedPage() {
  const [tab, setTab] = useState<Tab>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [catRes, teamsRes, stickersRes] = await Promise.all([
      fetch('/admin/seed/api/categories').then(r => r.json()),
      fetch('/admin/seed/api/teams').then(r => r.json()),
      fetch('/admin/seed/api/stickers').then(r => r.json()),
    ]);
    setCategories(catRes.categories || []);
    setTeams(teamsRes.teams || []);
    setStickers(stickersRes.stickers || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin — Gestión de Láminas</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(['categories', 'teams', 'stickers'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'categories' && '🏷️ Categorías'}
            {t === 'teams' && '🏆 Selecciones'}
            {t === 'stickers' && '🃏 Láminas'}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <CategoryPanel categories={categories} onSuccess={fetchData} />
      )}

      {tab === 'teams' && (
        <TeamPanel teams={teams} onSuccess={fetchData} />
      )}

      {tab === 'stickers' && (
        <StickerPanel categories={categories} teams={teams} stickers={stickers} onSuccess={fetchData} />
      )}
    </div>
  );
}

function CategoryPanel({ categories, onSuccess }: { categories: Category[]; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setLoading(true);
    try {
      const res = await fetch('/admin/seed/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, description: description || null }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else { toast.success(`Categoría "${name}" creada`); setName(''); setCode(''); setDescription(''); onSuccess(); }
    } catch { toast.error('Error al crear categoría'); }
    finally { setLoading(false); }
  };

  const deleteCategory = async (id: string, name: string) => {
    await fetch(`/admin/seed/api/categories?id=${id}`, { method: 'DELETE' });
    toast.success(`Categoría "${name}" eliminada`);
    onSuccess();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Agregar Categoría</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
              placeholder="Ej: Jugador, Especial, Estadio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm uppercase"
              placeholder="Ej: PLAYER, SPECIAL, STADIUM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
              placeholder="Descripción de la categoría"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name || !code}
            className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Categoría'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Categorías ({categories.length})</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No hay categorías aún</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div>
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{c.code}</span>
                  {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                </div>
                <button
                  onClick={() => deleteCategory(c.id, c.name)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamPanel({ teams, onSuccess }: { teams: Team[]; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setLoading(true);
    try {
      const res = await fetch('/admin/seed/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else { toast.success(`Selección "${name}" creada`); setName(''); setCode(''); onSuccess(); }
    } catch { toast.error('Error al crear selección'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Agregar Selección</h2>
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
          <button
            type="submit"
            disabled={loading || !name || !code}
            className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Selección'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Selecciones ({teams.length})</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-gray-500">No hay selecciones aún</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {teams.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div>
                  <span className="font-medium text-sm">{t.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{t.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StickerPanel({ categories, teams, stickers, onSuccess }: {
  categories: Category[];
  teams: Team[];
  stickers: Sticker[];
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [teamId, setTeamId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [estatura, setEstatura] = useState('');
  const [peso, setPeso] = useState('');
  const [clubActual, setClubActual] = useState('');
  const [paisClub, setPaisClub] = useState('');

  const [filterTeamId, setFilterTeamId] = useState('');

  const filteredStickers = filterTeamId
    ? stickers.filter(s => s.team?.code === teams.find(t => t.id === filterTeamId)?.code)
    : stickers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !teamId || !categoryId) return;
    setLoading(true);
    try {
      const res = await fetch('/admin/seed/api/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          team_id: teamId,
          category_id: categoryId,
          player_nombre: nombre || null,
          player_apellido: apellido || null,
          player_fecha_nacimiento: fechaNacimiento || null,
          player_estatura: estatura || null,
          player_peso: peso || null,
          player_club_actual: clubActual || null,
          player_pais_club: paisClub || null,
        }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else {
        toast.success(`Lámina "${code}" creada`);
        setCode(''); setNombre(''); setApellido(''); setFechaNacimiento('');
        setEstatura(''); setPeso(''); setClubActual(''); setPaisClub('');
        onSuccess();
      }
    } catch { toast.error('Error al crear lámina'); }
    finally { setLoading(false); }
  };

  const deleteSticker = async (id: string) => {
    await fetch(`/admin/seed/api/stickers?id=${id}`, { method: 'DELETE' });
    onSuccess();
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const isPlayerCategory = selectedCategory?.code === 'PLAYER';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Agregar Lámina</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm uppercase"
                placeholder="Ej: MEX1, FWC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selección *</label>
              <select
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">Seleccionar...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
            >
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>

          {isPlayerCategory && (
            <div className="border-t pt-3 mt-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos del Jugador</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                    placeholder="Ej: Lionel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    value={apellido}
                    onChange={e => setApellido(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                    placeholder="Ej: Messi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    value={fechaNacimiento}
                    onChange={e => setFechaNacimiento(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                    placeholder="Ej: 24-6-1987"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estatura (cm)</label>
                    <input
                      value={estatura}
                      onChange={e => setEstatura(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                      placeholder="Ej: 170"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      value={peso}
                      onChange={e => setPeso(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                      placeholder="Ej: 72"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Actual</label>
                  <input
                    value={clubActual}
                    onChange={e => setClubActual(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                    placeholder="Ej: Inter Miami"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País del Club</label>
                  <input
                    value={paisClub}
                    onChange={e => setPaisClub(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm"
                    placeholder="Ej: Estados Unidos"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code || !teamId || !categoryId}
            className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Lámina'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Láminas ({stickers.length})</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterTeamId}
              onChange={e => setFilterTeamId(e.target.value)}
              className="h-8 px-2 rounded-lg border border-gray-300 text-xs"
            >
              <option value="">Todas las selecciones</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.code}</option>)}
            </select>
          </div>
        </div>

        {filteredStickers.length === 0 ? (
          <p className="text-sm text-gray-500">Sin láminas. Crea una desde el panel izquierdo.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStickers.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-bold text-indigo-600 w-14 shrink-0">{s.code}</span>
                  <span className="font-medium truncate">
                    {[s.player_nombre, s.player_apellido].filter(Boolean).join(' ') || s.team?.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{s.team?.code}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{s.category?.code}</span>
                  {s.player_estatura && <span className="text-xs text-gray-400">{s.player_estatura}cm</span>}
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
