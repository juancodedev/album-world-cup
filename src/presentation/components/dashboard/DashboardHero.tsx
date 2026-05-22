'use client';

import { AlbumProgress } from '../collection/AlbumProgress';

interface DashboardHeroProps {
  userName?: string;
  total: number;
  owned: number;
  duplicates: number;
  missing: number;
}

export function DashboardHero({
  userName,
  total,
  owned,
  duplicates,
  missing,
}: DashboardHeroProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {userName ? `¡Hola, ${userName}!` : '¡Bienvenido!'}
        </h1>
        <p className="text-sm text-gray-500">Así va tu álbum del Mundial 2026</p>
      </div>
      <AlbumProgress
        total={total}
        owned={owned}
        duplicates={duplicates}
        missing={missing}
        size="lg"
      />
    </div>
  );
}
