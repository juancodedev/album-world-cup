'use client';

import { Progress } from '../../../components/ui/progress';

interface AlbumProgressProps {
  total: number;
  owned: number;
  duplicates: number;
  missing: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumProgress({
  total,
  owned,
  duplicates,
  missing,
  size = 'md',
}: AlbumProgressProps) {
  const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;

  const config = {
    sm: { padding: 'p-3', title: 'text-xs', value: 'text-lg', detail: 'text-[10px]' },
    md: { padding: 'p-5', title: 'text-sm', value: 'text-2xl', detail: 'text-xs' },
    lg: { padding: 'p-6', title: 'text-base', value: 'text-3xl', detail: 'text-sm' },
  };

  const c = config[size];

  return (
    <div className={`${c.padding} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`${c.title} font-semibold opacity-90`}>Progreso del Álbum</h3>
        <span className={`${c.value} font-bold`}>{percentage}%</span>
      </div>

      <Progress value={percentage} className="h-2.5 mb-4 bg-white/20 [&>div]:bg-white" />

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/15 rounded-lg p-2 text-center">
          <p className={`${c.value} font-bold`}>{owned}</p>
          <p className={`${c.detail} opacity-80`}>Obtenidas</p>
        </div>
        <div className="bg-white/15 rounded-lg p-2 text-center">
          <p className={`${c.value} font-bold`}>{missing}</p>
          <p className={`${c.detail} opacity-80`}>Faltan</p>
        </div>
        <div className="bg-white/15 rounded-lg p-2 text-center">
          <p className={`${c.value} font-bold`}>{duplicates}</p>
          <p className={`${c.detail} opacity-80`}>Repetidas</p>
        </div>
      </div>

      {size === 'lg' && missing > 0 && (
        <p className="mt-4 text-center text-sm opacity-80">
          Te faltan <strong>{missing}</strong> láminas para completar el álbum
        </p>
      )}
    </div>
  );
}
