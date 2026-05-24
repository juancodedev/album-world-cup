'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/tracker', label: 'Tracker', icon: '⚽' },
  { href: '/collection', label: 'Mi Colección', icon: '📦' },
  { href: '/statistics', label: 'Estadísticas', icon: '📊' },
  { href: '/share', label: 'Compartir', icon: '📤' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-white min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">AW</span>
        </div>
        <div>
          <h2 className="font-semibold text-sm">Album World</h2>
          <p className="text-xs text-gray-500">Mundial 2026</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
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

      <div className="px-4 py-4 border-t">
        <p className="text-xs text-gray-400 text-center">
          Album World Cup 2026 v1.0
        </p>
      </div>
    </aside>
  );
}
