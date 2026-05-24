'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Countdown } from './Countdown';

const navItems = [
  { href: '/tracker', label: 'Tracker', icon: '⚽' },
  { href: '/tracker/duplicates', label: 'Repetidas', icon: '🔁' },
  { href: '/share', label: 'Compartir', icon: '📤' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-white min-h-screen">
      <div className="px-3 pt-4 pb-2 border-b">
        <Countdown />
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
