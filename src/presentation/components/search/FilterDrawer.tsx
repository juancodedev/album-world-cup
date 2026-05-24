'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { RARITY, Rarity } from '../../../shared/constants/rarity.constants';

interface FilterDrawerProps {
  rarity?: string;
  teamId?: string;
  isSpecial?: boolean;
  onRarityChange: (value: string | undefined) => void;
  onTeamChange: (value: string | undefined) => void;
  onSpecialChange: (value: boolean | undefined) => void;
  onReset: () => void;
}

export function FilterDrawer({
  rarity,
  teamId,
  isSpecial,
  onRarityChange,
  _onTeamChange,
  onSpecialChange,
  onReset,
}: FilterDrawerProps) {
  const hasActiveFilters = rarity || teamId || isSpecial;

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        Filtros
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Rareza</Label>
            <Select
              value={rarity || ''}
              onValueChange={(v) => onRarityChange(v || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las rarezas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {(Object.keys(RARITY) as Rarity[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {RARITY[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Especiales</Label>
            <Select
              value={isSpecial === undefined ? 'all' : isSpecial ? 'special' : 'normal'}
              onValueChange={(v) => {
                if (v === 'all') onSpecialChange(undefined);
                else onSpecialChange(v === 'special');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="special">Solo especiales</SelectItem>
                <SelectItem value="normal">Solo normales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" className="w-full" onClick={onReset}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
