/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { StickerGrid } from '../../../src/presentation/components/tracker/StickerGrid';
import type { StickerDTO } from '../../../src/application/dtos/sticker.dto';

function createSticker(id: string, number: number, teamCode: string): StickerDTO {
  return {
    id,
    albumId: '00000000-0000-0000-0000-000000000001',
    number,
    playerId: null,
    playerName: null,
    teamId: 'team-1',
    teamName: teamCode,
    teamFlag: null,
    stickerTypeId: 'type-1',
    stickerTypeName: 'Standard',
    rarity: 'common',
    rarityLabel: 'Common',
    imageUrl: '',
    imageThumbnail: null,
    isSpecial: false,
    specialAttribute: null,
    state: 'missing',
    duplicateCount: 0,
    createdAt: '2026-01-01',
  };
}

describe('StickerGrid — slots prop', () => {
  const ownedSet = new Set<string>();
  const onToggle = jest.fn();

  it('renders default 20 slots when slots prop is not provided', () => {
    const stickers: StickerDTO[] = [];
    const { container } = render(
      <StickerGrid
        teamCode="ARG"
        stickers={stickers}
        ownedSet={ownedSet}
        onToggle={onToggle}
      />,
    );

    // Default: 20 slots. Grid renders buttons (one per slot). Empty slots still have buttons.
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(20);
  });

  it('renders exactly 14 slots when slots=14 is provided', () => {
    const stickers: StickerDTO[] = [
      createSticker('coc-1', 992, 'CC'),
    ];

    const { container } = render(
      <StickerGrid
        teamCode="CC"
        stickers={stickers}
        ownedSet={ownedSet}
        onToggle={onToggle}
        slots={14}
      />,
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(14);
  });

  it('renders CC1 through CC14 codes when slots=14 and teamCode=CC', () => {
    const stickers: StickerDTO[] = [];
    const { container } = render(
      <StickerGrid
        teamCode="CC"
        stickers={stickers}
        ownedSet={ownedSet}
        onToggle={onToggle}
        slots={14}
      />,
    );

    // Check codes are CC1, CC2, ..., CC14
    const codeSpans = container.querySelectorAll('.font-mono');
    const codes = Array.from(codeSpans).map(el => el.textContent);
    expect(codes).toEqual([
      'CC1', 'CC2', 'CC3', 'CC4', 'CC5', 'CC6', 'CC7',
      'CC8', 'CC9', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
    ]);
  });

  it('renders 20 slots with default slots (backward compatible)', () => {
    const stickers: StickerDTO[] = [];
    const { container } = render(
      <StickerGrid
        teamCode="ARG"
        stickers={stickers}
        ownedSet={ownedSet}
        onToggle={onToggle}
        slots={20}
      />,
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(20);
  });
});
