/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MissingListScreen } from '../../../src/presentation/components/tracker/MissingListScreen';
import type { GroupData, SpecialData } from '../../../src/presentation/hooks/useTracker';
import type { StickerDTO } from '../../../src/application/dtos/sticker.dto';

function createFWCSticker(id: string, number: number, code: string, state: 'missing' | 'obtained'): StickerDTO {
  return {
    id,
    albumId: '00000000-0000-0000-0000-000000000001',
    number,
    playerId: null,
    playerName: null,
    teamId: null,
    teamName: null,
    teamFlag: null,
    stickerTypeId: 'f0000000-0000-0000-0000-000000000003',
    stickerTypeName: 'Special',
    rarity: 'common',
    rarityLabel: 'Common',
    imageUrl: '',
    imageThumbnail: null,
    isSpecial: true,
    specialAttribute: 'FWC',
    state,
    duplicateCount: 0,
    createdAt: '2026-01-01',
  };
}

describe('MissingListScreen with FWC00 (startPosition=0)', () => {
  it('includes FWC00 in missing list when unowned', () => {
    const fwcStickers: StickerDTO[] = [];
    for (let i = 0; i < 20; i++) {
      fwcStickers.push(createFWCSticker(`fwc-${i}`, 961 + i, `FWC${i === 0 ? '00' : i}`, 'missing'));
    }

    const specials: SpecialData[] = [
      {
        code: 'FWC',
        name: 'Sección Especial',
        icon: '\uD83C\uDF0E',
        count: 20,
        startPosition: 0,
        stickers: fwcStickers,
        ownedCount: 0,
      },
    ];

    render(
      <MissingListScreen
        groups={[]}
        specials={specials}
        ownedSet={new Set()}
        onToggle={jest.fn()}
      />
    );

    // FWC00 should appear in the missing list
    expect(screen.getByText('FWC00')).toBeTruthy();
  });

  it('excludes FWC00 from missing list when owned', () => {
    const fwcStickers: StickerDTO[] = [
      createFWCSticker('fwc-0', 961, 'FWC00', 'obtained'),
    ];

    const specials: SpecialData[] = [
      {
        code: 'FWC',
        name: 'Sección Especial',
        icon: '\uD83C\uDF0E',
        count: 20,
        startPosition: 0,
        stickers: fwcStickers,
        ownedCount: 1,
      },
    ];

    render(
      <MissingListScreen
        groups={[]}
        specials={specials}
        ownedSet={new Set()}
        onToggle={jest.fn()}
      />
    );

    // Since FWC00 is the only sticker and it's obtained, the special section
    // should not appear at all (no missing stickers in it)
    expect(screen.queryByText('FWC00')).toBeNull();
  });

  it('does NOT list FWC20 (FWC section is only FWC00-FWC19)', () => {
    const fwcStickers: StickerDTO[] = [];
    for (let i = 0; i < 20; i++) {
      fwcStickers.push(createFWCSticker(`fwc-${i}`, 961 + i, `FWC${i === 0 ? '00' : i}`, 'missing'));
    }

    const specials: SpecialData[] = [
      {
        code: 'FWC',
        name: 'Sección Especial',
        icon: '\uD83C\uDF0E',
        count: 20,
        startPosition: 0,
        stickers: fwcStickers,
        ownedCount: 0,
      },
    ];

    render(
      <MissingListScreen
        groups={[]}
        specials={specials}
        ownedSet={new Set()}
        onToggle={jest.fn()}
      />
    );

    // FWC20 should never appear
    expect(screen.queryByText('FWC20')).toBeNull();
  });
});
