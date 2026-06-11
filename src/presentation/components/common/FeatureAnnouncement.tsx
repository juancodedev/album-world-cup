'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface FeatureItem {
  emoji: string;
  title: string;
  description: string;
}

export interface FeatureAnnouncementProps {
  /** Unique ID for this feature — dismissal is persisted in localStorage */
  featureId: string;
  /** Emoji or icon for the announcement header */
  icon: string;
  /** Main title */
  title: string;
  /** Short description */
  description: string;
  /** List of feature highlights */
  features: FeatureItem[];
  /** Label for the CTA button (default: "¡Entendido!") */
  ctaLabel?: string;
  /** Optional action to run on CTA click */
  onCta?: () => void;
}

const STORAGE_PREFIX = 'feature-announcement-dismissed:';

/**
 * Reusable feature announcement popup.
 *
 * Shows once per `featureId` — dismissal is persisted in localStorage.
 * To show a new announcement, just change the `featureId`.
 *
 * @example
 * ```tsx
 * <FeatureAnnouncement
 *   featureId="exchange-system-v1"
 *   icon="🔄"
 *   title="¡Nuevo! Intercambio de stickers"
 *   description="Ahora puedes intercambiar tus repetidos con otros usuarios registrados."
 *   features={[
 *     { emoji: "📤", title: "Ofrece tus repetidos", description: "Selecciona un sticker que tengas repetido y ofrécelo." },
 *     { emoji: "🔍", title: "Explora ofertas", description: "Ve lo que otros usuarios están ofreciendo." },
 *   ]}
 * />
 * ```
 */
export function FeatureAnnouncement({
  featureId,
  icon,
  title,
  description,
  features,
  ctaLabel = '¡Entendido!',
  onCta,
}: FeatureAnnouncementProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${featureId}`);
    if (!dismissed) {
      // Small delay so the page loads first, then the popup appears
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [featureId]);

  const handleDismiss = () => {
    localStorage.setItem(`${STORAGE_PREFIX}${featureId}`, 'true');
    setOpen(false);
    onCta?.();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleDismiss();
      setOpen(isOpen);
    }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <span className="text-5xl">{icon}</span>
            <DialogTitle className="text-xl font-black">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-xs">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {features.map((f, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xl mt-0.5 flex-shrink-0">{f.emoji}</span>
              <div>
                <div className="font-bold text-sm">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="border-0 pt-2">
          <Button onClick={handleDismiss} className="w-full font-bold">
            {ctaLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
