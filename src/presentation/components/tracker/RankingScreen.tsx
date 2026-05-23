'use client';

import Link from 'next/link';
import { ChevronLeft, Trophy } from 'lucide-react';

interface RankingEntry {
  userId: string;
  name: string;
  avatar: string;
  owned: number;
  total: number;
  percentage: number;
}

interface RankingScreenProps {
  data: RankingEntry[];
  currentUserId: string | null;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function RankingScreen({ data, currentUserId }: RankingScreenProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {currentUserId && (
          <Link
            href="/tracker"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
        )}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] tracking-[3px] font-bold text-pink-500">TABLA</div>
            <h1 className="text-lg font-black text-gray-900">Ranking coleccionistas</h1>
          </div>
        </div>
      </div>

      {/* CTA for non-logged-in visitors */}
      {!currentUserId && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center space-y-4">
          <div className="text-3xl">🏆</div>
          <div>
            <p className="text-sm font-bold text-gray-800">
              ¿Quieres aparecer en el ranking?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Crea una cuenta y empieza a coleccionar. Compite con todos los coleccionistas de la plataforma.
            </p>
          </div>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            Crear cuenta gratis
          </a>
          <p className="text-[10px] text-gray-400">Ya tienes cuenta? <a href="/login" className="text-amber-600 underline">Inicia sesión</a></p>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm">
            Aún no hay coleccionistas en la plataforma. ¡Sé el primero!
          </div>
        ) : (
          data.map((entry, i) => {
            const isMe = currentUserId ? entry.userId === currentUserId : false;
            const pctColor = i === 0 ? '#ffd60a' : i === 1 ? '#bdbdbd' : i === 2 ? '#ff9800' : '#f72585';

            return (
              <div
                key={entry.userId}
                className={`rounded-xl border p-4 transition-all ${
                  isMe
                    ? 'border-pink-200 bg-pink-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Position */}
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="text-xl">{MEDALS[i] || `#${i + 1}`}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                    {entry.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-bold bg-pink-500 text-white px-1.5 py-0.5 rounded">
                          TÚ
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor: pctColor,
                        }}
                      />
                    </div>

                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">
                        {entry.owned} stickers
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        {entry.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
