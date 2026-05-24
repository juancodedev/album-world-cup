'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { Button } from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  access_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface LogRow {
  id: string;
  user_id: string;
  action: string;
  reason: string;
  notes: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.email !== 'cl.jmunoz@gmail.com')) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch('/api/access/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLogs(d.logs || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (userId: string, currentStatus: string) => {
    const action = currentStatus === 'disabled' || currentStatus === 'expired' ? 'enable' : 'disable';
    setToggling(userId);
    try {
      const res = await fetch('/api/access/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, notes: note || undefined }),
      });
      if (res.ok) {
        const d = await fetch('/api/access/admin/users').then(r => r.json());
        setUsers(d.users || []);
        setLogs(d.logs || []);
        setNote('');
      }
    } catch {}
    setToggling(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      trial: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700',
      disabled: 'bg-gray-200 text-gray-600',
    };
    const labels: Record<string, string> = {
      trial: 'Prueba',
      active: 'Activo',
      expired: 'Vencido',
      disabled: 'Deshabilitado',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold text-gray-600">Email</th>
                <th className="text-left p-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left p-3 font-semibold text-gray-600">Estado</th>
                <th className="text-left p-3 font-semibold text-gray-600">Trial</th>
                <th className="text-right p-3 font-semibold text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700 font-medium">{u.email}</td>
                  <td className="p-3 text-gray-500">{u.full_name || '—'}</td>
                  <td className="p-3">{statusBadge(u.access_status)}</td>
                  <td className="p-3 text-xs text-gray-400">
                    {u.trial_started_at
                      ? `${new Date(u.trial_started_at).toLocaleDateString()} → ${new Date(u.trial_ends_at!).toLocaleDateString()}`
                      : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant={u.access_status === 'disabled' || u.access_status === 'expired' ? 'default' : 'outline'}
                      onClick={() => toggleUser(u.id, u.access_status)}
                      disabled={toggling === u.id}
                    >
                      {toggling === u.id ? '...' : u.access_status === 'disabled' || u.access_status === 'expired' ? 'Habilitar' : 'Deshabilitar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Nota (opcional)</h3>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ej: Pago recibido, transferencia #123..."
          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Historial de cambios</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">Sin registros</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-xs p-2 bg-gray-50 rounded-lg">
                <span className={`font-bold ${log.action === 'enabled' ? 'text-green-600' : 'text-red-600'}`}>
                  {log.action === 'enabled' ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <span className="font-medium">{log.reason.replace(/_/g, ' ')}</span>
                    {log.notes && <span className="text-gray-400"> — {log.notes}</span>}
                  </p>
                  <p className="text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
