'use client';

import { Progress } from '../../../components/ui/progress';

interface ProgressCardProps {
  title: string;
  percentage: number;
  current: number;
  total: number;
  icon?: string;
  color?: string;
}

export function ProgressCard({
  title,
  percentage,
  current,
  total,
  icon = '📊',
  color = 'blue',
}: ProgressCardProps) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-600' },
  };

  const c = colors[color as keyof typeof colors] || colors.blue;

  return (
    <div className={`${c.bg} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">{icon}</span>
        <span className={`text-2xl font-bold ${c.text}`}>{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${c.bar} [&>div]:${c.bar}`}
      />
      <div className="flex justify-between mt-2">
        <p className="text-xs text-gray-600">{title}</p>
        <p className="text-xs font-medium text-gray-700">{current}/{total}</p>
      </div>
    </div>
  );
}
