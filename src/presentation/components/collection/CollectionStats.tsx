'use client';

import { CollectionStatsDTO } from '../../../application/dtos/collection-stats.dto';

interface CollectionStatsProps {
  stats: CollectionStatsDTO | null;
}

export function CollectionStats({ stats }: CollectionStatsProps) {
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Obtenidas" value={stats.ownedStickers} icon="✓" color="text-green-600" />
        <StatCard label="Faltantes" value={stats.missingStickers} icon="✗" color="text-red-600" />
        <StatCard label="Repetidas" value={stats.totalDuplicates} icon="🔄" color="text-blue-600" />
        <StatCard label="Última semana" value={stats.recentlyAdded} icon="📅" color="text-purple-600" />
      </div>


    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-3 text-center">
      <span className={`text-lg ${color}`}>{icon}</span>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
