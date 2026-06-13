/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { StickerGrid } from '../../../src/presentation/components/tracker/StickerGrid';
import type { StickerDTO } from '../../../src/application/dtos/sticker.dto';

function createFWCSticker(id: string, number: number, state: 'missing' | 'obtained'): StickerDTO {
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

describe('StickerGrid with startPosition=0 (FWC00)', () => {
  it('renders 20 cells with FWC00 at position 0 and FWC19 at position 19', () => {
    const stickers: StickerDTO[] = [];
    for (let i = 0; i < 20; i++) {
      stickers.push(createFWCSticker(`fwc-${i}`, 961 + i, 'missing'));
    }

    render(
      <StickerGrid
        teamCode="FWC"
        stickers={stickers}
        ownedSet={new Set()}
        onToggle={jest.fn()}
        startPosition={0}
      />
    );

    // All 20 cells rendered
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(20);

    // First cell renders code FWC00 (not FWC0)
    expect(screen.getByText('FWC00')).toBeTruthy();

    // Last cell renders code FWC19
    expect(screen.getByText('FWC19')).toBeTruthy();
  });

  it('shows FWC00 with owned state when sticker is owned', () => {
    const stickers: StickerDTO[] = [
      createFWCSticker('fwc-0', 961, 'obtained'),
    ];

    render(
      <StickerGrid
        teamCode="FWC"
        stickers={stickers}
        ownedSet={new Set(['fwc-0'])}
        onToggle={jest.fn()}
        startPosition={0}
      />
    );

    // FWC00 should have the "Desmarcar" aria-label (meaning it's owned)
    const fwc00Cell = screen.getByRole('button', { name: 'Desmarcar sticker #0' });
    expect(fwc00Cell).toBeTruthy();
  });

  it('does NOT render FWC20 when startPosition=0 and count=20', () => {
    const stickers: StickerDTO[] = [];
    for (let i = 0; i < 20; i++) {
      stickers.push(createFWCSticker(`fwc-${i}`, 961 + i, 'missing'));
    }

    render(
      <StickerGrid
        teamCode="FWC"
        stickers={stickers}
        ownedSet={new Set()}
        onToggle={jest.fn()}
        startPosition={0}
      />
    );

    expect(screen.queryByText('FWC20')).toBeNull();
  });

  it('toggles FWC00 via onToggle when clicked', () => {
    const stickers: StickerDTO[] = [
      createFWCSticker('fwc-0', 961, 'missing'),
    ];
    const onToggle = jest.fn();

    render(
      <StickerGrid
        teamCode="FWC"
        stickers={stickers}
        ownedSet={new Set()}
        onToggle={onToggle}
        startPosition={0}
      />
    );

    const fwc00Cell = screen.getByRole('button', { name: 'Marcar sticker #0' });
    fireEvent.click(fwc00Cell);

    expect(onToggle).toHaveBeenCalledWith('fwc-0');
  });
});
