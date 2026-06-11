'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/tracker', label: 'Tracker', icon: '⚽', exact: true },
  { href: '/tracker/duplicates', label: 'Repetidas', icon: '🔁' },
  { href: '/tracker/exchange', label: 'Intercambio', icon: '🔄' },
  { href: '/tracker/ranking', label: 'Ranking', icon: '🏆' },
  { href: '/share', label: 'Compartir', icon: '📤' },
  { href: '/settings', label: 'Ajustes', icon: '⚙️' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-lg md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-1.5 sm:px-3 py-1.5 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
