import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Album World Cup 2026',
  description: 'Gestiona y haz seguimiento de tu álbum del Mundial 2026',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Album WC 2026',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <div className="flex-1">{children}</div>
          <footer className="text-center text-xs text-muted-foreground py-4 border-t bg-card">
            Creado por{' '}
            <a href="https://www.juancode.dev" target="_blank" rel="noopener noreferrer"
               className="text-primary hover:underline">
              Juan Muñoz
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
