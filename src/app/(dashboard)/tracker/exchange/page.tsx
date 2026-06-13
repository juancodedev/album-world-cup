'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../../presentation/providers/AuthProvider';
import { useCurrentAccount } from '../../../../presentation/hooks/useCurrentAccount';
import { useTracker } from '../../../../presentation/hooks/useTracker';
import {
  usePendingExchangeOffers,
  useCreateExchangeOffer,
  useAcceptExchangeOffer,
  useCancelExchangeOffer,
  useUserExchangeOffers,
} from '../../../../presentation/hooks/useExchange';
import { DashboardLayout } from '../../../../presentation/layouts/DashboardLayout';
import { ExchangeCard } from '../../../../presentation/components/exchange/ExchangeCard';
import { CreateExchangeDialog } from '../../../../presentation/components/exchange/CreateExchangeDialog';
import { ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FLAG_EMOJI } from '../../../../shared/constants/flags.constants';
import { STICKERS_PER_TEAM } from '../../../../shared/constants/tracker.constants';

export default function ExchangePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: defaultAccount } = useCurrentAccount(user?.id);
  const accountId = defaultAccount?.id || '';
  const { collection } = useTracker();

  const [tab, setTab] = useState<'disponibles' | 'mis-ofertas'>('disponibles');

  // Fetch teams for sticker code rendering
  const teamsQuery = useQuery<{ id: string; code: string; name: string; flag_url: string | null }[]>({
    queryKey: ['tracker-teams', '00000000-0000-0000-0000-000000000001'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      const data = await res.json();
      return data.teams || [];
    },
    enabled: !!accountId,
  });

  const teamInfoMap = useMemo(() => {
    const map = new Map<string, { code: string; name: string; flag: string | null }>();
    if (teamsQuery.data) {
      for (const team of teamsQuery.data) {
        map.set(team.id, {
          code: team.code,
          name: team.name,
          flag: FLAG_EMOJI[team.code] || team.flag_url || null,
        });
      }
    }
    return map;
  }, [teamsQuery.data]);

  const teamCodeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, info] of teamInfoMap) {
      map.set(id, info.code);
    }
    return map;
  }, [teamInfoMap]);

  // Hooks
  const { offers: pendingOffers, isLoading: loadingPending, refetch } = usePendingExchangeOffers(user?.id);
  const { data: userOffers, isLoading: loadingUserOffers } = useUserExchangeOffers(user?.id);
  const createMutation = useCreateExchangeOffer();
  const acceptMutation = useAcceptExchangeOffer();
  const cancelMutation = useCancelExchangeOffer();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // Helper: global number → local per-team position (1-20)
  const localNumber = (globalNum: number) => ((globalNum - 1) % STICKERS_PER_TEAM) + 1;

  // Build duplicates list for the current user with team codes
  const myDuplicates = useMemo(() => {
    if (!collection) return [];
    return collection
      .filter(s => s.duplicateCount > 0)
      .map(s => {
        const teamInfo = s.teamId ? teamInfoMap.get(s.teamId) : null;
        const local = teamInfo ? localNumber(s.number) : s.number;
        const code = teamInfo
          ? `${teamInfo.code}${local}`
          : `#${s.number}`;
        return {
          stickerId: s.id,
          teamId: s.teamId || '',
          code,
          teamName: teamInfo?.name || s.teamName || '',
          teamFlag: teamInfo?.flag || null,
          count: s.duplicateCount,
          image: s.imageThumbnail || s.imageUrl,
        };
      });
  }, [collection, teamInfoMap]);

  const handleCreateOffer = async (input: {
    offeredStickerId: string;
    requestedStickerId?: string;
    message?: string;
  }) => {
    if (!user || !accountId) return;
    try {
      await createMutation.mutateAsync({
        ...input,
        fromUserId: user.id,
        fromAccountId: accountId,
      });
      toast.success('Oferta publicada', {
        description: 'Tu oferta de intercambio ya está visible para otros usuarios.',
      });
      refetch();
    } catch (err) {
      toast.error('Error al crear oferta', {
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
      });
    }
  };

  const handleCancel = async (offerId: string) => {
    if (!user) return;
    try {
      await cancelMutation.mutateAsync({ offerId, userId: user.id });
      toast.success('Oferta cancelada');
      refetch();
    } catch (err) {
      toast.error('Error al cancelar', {
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
      });
    }
  };

  const handleAccept = async (offerId: string) => {
    if (!user || !accountId) return;
    try {
      await acceptMutation.mutateAsync({
        offerId,
        acceptedByUserId: user.id,
        acceptedByAccountId: accountId,
      });
      toast.success('¡Intercambio completado!', {
        description: 'Los stickers se transfirieron correctamente.',
      });
      refetch();
    } catch (err) {
      toast.error('Error al aceptar', {
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
      });
    }
  };

  // Helper: resolve exchange offer → display data for ExchangeCard
  const resolveOffer = (offer: import('../../../../domain/entities/exchange-offer.entity').ExchangeOffer) => {
    const offeredSticker = collection?.find(s => s.id === offer.offeredStickerId);
    const offeredTeam = offeredSticker?.teamId ? teamInfoMap.get(offeredSticker.teamId) : null;
    const offeredLocal = offeredTeam ? localNumber(offeredSticker!.number) : offeredSticker?.number;
    const offeredCode = offeredTeam ? `${offeredTeam.code}${offeredLocal}` : `#${offeredSticker?.number ?? '?'}`;

    const requestedSticker = offer.requestedStickerId ? collection?.find(s => s.id === offer.requestedStickerId) : null;
    const requestedTeam = requestedSticker?.teamId ? teamInfoMap.get(requestedSticker.teamId) : null;
    const requestedLocal = requestedTeam ? localNumber(requestedSticker!.number) : requestedSticker?.number;
    const requestedCode = requestedTeam ? `${requestedTeam.code}${requestedLocal}` : null;

    return {
      offerId: offer.id,
      fromUserName: 'Yo',
      fromUserAvatar: null,
      offeredCode,
      offeredImage: offeredSticker?.imageThumbnail || null,
      offeredTeam: offeredTeam?.name || null,
      requestedCode,
      requestedImage: requestedSticker?.imageThumbnail || null,
      requestedTeam: requestedTeam?.name || null,
      status: offer.status,
      isOwn: true,
      message: offer.message ?? null,
      createdAt: offer.createdAt.toISOString(),
    };
  };

  if (authLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/tracker"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="text-[10px] tracking-[3px] font-bold text-blue-500">NUEVO</div>
            <h1 className="text-lg font-black text-gray-900">Intercambio</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <CreateExchangeDialog
              userId={user.id}
              accountId={accountId}
              collection={collection || []}
              duplicates={myDuplicates}
              teamInfoMap={teamInfoMap}
              onCreateOffer={handleCreateOffer}
              isPending={createMutation.isPending}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('disponibles')}
            className={`flex-1 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'disponibles'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setTab('mis-ofertas')}
            className={`flex-1 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'mis-ofertas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Mis ofertas
          </button>
        </div>

        {/* Content */}
        {loadingPending ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : tab === 'disponibles' ? (
          pendingOffers.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
              <span className="text-6xl mb-4">🔄</span>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Sin ofertas disponibles</h2>
              <p className="text-gray-500 text-sm max-w-xs">
                No hay intercambios activos por ahora. Crea una oferta con tus repetidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOffers.map(offer => (
                // <ExchangeCard
                //   key={offer.id}
                //   offerId={offer.id}
                //   fromUserName={offer.fromUserId}
                //   fromUserAvatar={null}
                //   offeredCode={offer.offeredStickerId.slice(0, 8)}
                //   offeredImage={null}
                //   offeredTeam={null}
                //   requestedCode={offer.requestedStickerId ? offer.requestedStickerId.slice(0, 8) : null}
                //   requestedImage={null}
                //   requestedTeam={null}
                //   status={offer.status}
                //   isOwn={offer.fromUserId === user?.id}
                //   message={offer.message ?? null}
                //   createdAt={offer.createdAt.toISOString()}
                //   onAccept={handleAccept}
                //   isPendingAction={acceptMutation.isPending}
                // />

                <ExchangeCard
                key={offer.id}
                {...resolveOffer(offer)}
                onCancel={handleCancel}
                isPendingAction={cancelMutation.isPending}
              />
              ))}
            </div>
          )
        ) : loadingUserOffers ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !userOffers || userOffers.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
            <span className="text-6xl mb-4">📋</span>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Tus ofertas</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              No tienes ofertas aún. Creá una desde la pestaña Disponibles.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userOffers.map(offer => (
              <ExchangeCard
                key={offer.id}
                {...resolveOffer(offer)}
                onCancel={handleCancel}
                isPendingAction={cancelMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
