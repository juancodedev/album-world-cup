'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Album {
  id: string;
  name: string;
  year: number;
  tournament_type: string;
  description: string | null;
  image_url: string | null;
  total_stickers: number;
  special_stickers: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const initialForm = {
  name: '',
  year: new Date().getFullYear(),
  tournamentType: 'world_cup',
  description: '',
  imageUrl: '',
  totalStickers: 100,
  specialStickers: 0,
};

type FormState = typeof initialForm;

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAlbums = useCallback(async () => {
    const res = await fetch('/admin/albums/api');
    const data = await res.json();
    if (data.albums) setAlbums(data.albums);
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  const handleImageUpload = async (file: File, code: string): Promise<string | null> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('code', code);
    const res = await fetch('/admin/albums/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.error) {
      toast.error('Error al subir imagen: ' + data.error);
      return null;
    }
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.year || !form.totalStickers) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setLoading(true);

    if (editingId) {
      const res = await fetch('/admin/albums/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error('Error al actualizar: ' + JSON.stringify(data.error));
      } else {
        toast.success('Álbum actualizado');
        setForm(initialForm);
        setEditingId(null);
        fetchAlbums();
      }
    } else {
      const res = await fetch('/admin/albums/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        toast.error('Error al crear: ' + JSON.stringify(data.error));
      } else {
        toast.success('Álbum creado');
        setForm(initialForm);
        fetchAlbums();
      }
    }

    setLoading(false);
  };

  const handleEdit = (album: Album) => {
    setEditingId(album.id);
    setForm({
      name: album.name,
      year: album.year,
      tournamentType: album.tournament_type,
      description: album.description || '',
      imageUrl: album.image_url || '',
      totalStickers: album.total_stickers,
      specialStickers: album.special_stickers,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este álbum?')) return;
    const res = await fetch(`/admin/albums/api?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Álbum eliminado');
      fetchAlbums();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const code = form.name || 'album';
    const url = await handleImageUpload(file, code);
    if (url) setForm({ ...form, imageUrl: url });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Álbumes</h1>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Álbum' : 'Nuevo Álbum'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="World Cup 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={form.tournamentType}
                    onChange={e => setForm({ ...form, tournamentType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="world_cup">Mundial</option>
                    <option value="euro">Eurocopa</option>
                    <option value="copa_america">Copa América</option>
                    <option value="champions">Champions League</option>
                    <option value="league">Liga</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Álbum oficial del Mundial 2026..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Láminas *</label>
                  <input
                    type="number"
                    value={form.totalStickers}
                    onChange={e => setForm({ ...form, totalStickers: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Láminas Especiales</label>
                  <input
                    type="number"
                    value={form.specialStickers}
                    onChange={e => setForm({ ...form, specialStickers: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploading && <p className="text-xs text-gray-400 mt-1">Subiendo imagen...</p>}
                {form.imageUrl && !uploading && (
                  <div className="mt-2 relative">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {form.imageUrl && !uploading && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">O URL directa</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Álbum'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setForm(initialForm); setEditingId(null); }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Álbumes ({albums.length})
              </h2>
            </div>

            {albums.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No hay álbumes todavía. Crea el primero.
              </div>
            ) : (
              <div className="divide-y">
                {albums.map(album => (
                  <div key={album.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {album.image_url ? (
                      <img
                        src={album.image_url}
                        alt={album.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-indigo-500 font-bold">
                        {album.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{album.name}</h3>
                        {!album.is_active && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Inactivo</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {album.year} · {album.total_stickers} láminas · {album.tournament_type}
                      </p>
                      {album.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{album.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(album)}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(album.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
