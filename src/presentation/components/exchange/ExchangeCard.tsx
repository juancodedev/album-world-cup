'use client';

import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';

interface ExchangeCardProps {
  offerId: string;
  fromUserName: string;
  fromUserAvatar: string | null;
  offeredCode: string;
  offeredImage: string | null;
  offeredTeam: string | null;
  requestedCode: string | null;
  requestedImage: string | null;
  requestedTeam: string | null;
  status: string;
  isOwn: boolean;
  message: string | null;
  createdAt: string;
  onAccept?: (offerId: string) => void;
  onCancel?: (offerId: string) => void;
  isPendingAction?: boolean;
}

export function ExchangeCard({
  offerId,
  fromUserName,
  fromUserAvatar,
  offeredCode,
  offeredImage,
  offeredTeam,
  requestedCode,
  requestedImage,
  requestedTeam,
  status,
  isOwn,
  message,
  createdAt,
  onAccept,
  onCancel,
  isPendingAction,
}: ExchangeCardProps) {
  const isPending = status === 'pending';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled' || status === 'rejected';

  const timeAgo = getTimeAgo(new Date(createdAt));

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isPending
        ? 'border-gray-200 bg-white'
        : isCompleted
        ? 'border-green-200 bg-green-50/50'
        : isCancelled
        ? 'border-gray-100 bg-gray-50/50'
        : 'border-blue-200 bg-blue-50/50'
    }`}>
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
          {fromUserAvatar ? (
            <img src={fromUserAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            fromUserName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm truncate">{fromUserName}</span>
            {isOwn && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Tu oferta
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto shrink-0">{timeAgo}</span>
          </div>

          {/* Message */}
          {message && (
            <p className="text-xs text-muted-foreground mb-3 italic">&ldquo;{message}&rdquo;</p>
          )}

          {/* Exchange layout */}
          <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
            {/* Offered sticker */}
            <div className="flex-1 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">Ofrece</div>
              <div className="flex flex-col items-center gap-1">
                {offeredImage ? (
                  <img src={offeredImage} alt="" className="w-10 h-10 object-contain rounded" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {offeredCode}
                  </div>
                )}
                <div className="font-bold text-xs">{offeredCode}</div>
                {offeredTeam && (
                  <div className="text-[10px] text-muted-foreground">{offeredTeam}</div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              {requestedCode ? (
                <span className="text-xl">⇄</span>
              ) : (
                <span className="text-xl">→</span>
              )}
            </div>

            {/* Requested sticker */}
            <div className="flex-1 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">
                {requestedCode ? 'Recibe' : 'Regala'}
              </div>
              {requestedCode ? (
                <div className="flex flex-col items-center gap-1">
                  {requestedImage ? (
                    <img src={requestedImage} alt="" className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                      {requestedCode}
                    </div>
                  )}
                  <div className="font-bold text-xs">{requestedCode}</div>
                  {requestedTeam && (
                    <div className="text-[10px] text-muted-foreground">{requestedTeam}</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-3">¡Gratis!</div>
              )}
            </div>
          </div>

          {/* Status badge + actions */}
          <div className="flex items-center justify-between mt-3">
            <StatusBadge status={status} />
            <div className="flex gap-2">
              {isPending && !isOwn && onAccept && (
                <Button
                  size="sm"
                  onClick={() => onAccept(offerId)}
                  disabled={isPendingAction}
                  className="font-bold text-xs gap-1"
                >
                  {isPendingAction ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Aceptar
                </Button>
              )}
              {isPending && isOwn && onCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(offerId)}
                  disabled={isPendingAction}
                  className="text-xs gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
  };

  const labels: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    rejected: 'Rechazado',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
