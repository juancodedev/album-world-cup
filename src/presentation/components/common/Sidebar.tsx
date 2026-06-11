'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Countdown } from './Countdown';

const navItems = [
  { href: '/tracker', label: 'Tracker', icon: '⚽', exact: true },
  { href: '/tracker/duplicates', label: 'Repetidas', icon: '🔁' },
  { href: '/tracker/exchange', label: 'Intercambio', icon: '🔄' },
  { href: '/tracker/ranking', label: 'Ranking', icon: '🏆' },
  { href: '/share', label: 'Compartir', icon: '📤' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen">
      <div className="px-3 pt-4 pb-2 border-b">
        <Countdown />
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
