/**
 * Unit tests for formatSpecialCode helper.
 *
 * This function resolves a sticker's display code given its global number and
 * special_attribute. It is duplicated across exchange/page.tsx and
 * CreateExchangeDialog.tsx (intentional, per design). This test validates the
 * contract that both sites must implement.
 */

import { SPECIAL_SECTIONS, STICKERS_PER_TEAM } from '../../../src/shared/constants/tracker.constants';

// ── Replicated logic (must match exchange/page.tsx and CreateExchangeDialog.tsx) ──

const TEAM_TOTAL = 48 * STICKERS_PER_TEAM; // 960

const specialRanges = (() => {
  let offset = TEAM_TOTAL + 1;
  return SPECIAL_SECTIONS.map(sec => ({
    attribute: sec.code,
    displayCode: ('displayCode' in sec ? (sec as { displayCode?: string }).displayCode : undefined) ?? sec.code,
    startGlobal: offset,
    count: sec.count,
    startPosition: (sec as { startPosition?: number }).startPosition ?? 1,
    _end: (offset += sec.count) - sec.count,
  }));
})();

function formatSpecialCode(specialAttribute: string, globalNumber: number): string {
  const r = specialRanges.find(s => s.attribute === specialAttribute);
  if (!r) return `#${globalNumber}`;
  const localPos = (globalNumber - r.startGlobal) + r.startPosition;
  return `${r.displayCode}${localPos === 0 ? '00' : String(localPos)}`;
}

// ── Tests ──

describe('formatSpecialCode', () => {
  it('returns CC12 for COC sticker at global number 1003', () => {
    // COC stickers: startGlobal = 961+20=981+11=992, count=14
    // COC starts at global 992. 1003 - 992 + 1 = 12
    expect(formatSpecialCode('COC', 1003)).toBe('CC12');
  });

  it('returns CC1 for COC sticker at global number 992', () => {
    expect(formatSpecialCode('COC', 992)).toBe('CC1');
  });

  it('returns CC14 for COC sticker at global number 1005', () => {
    expect(formatSpecialCode('COC', 1005)).toBe('CC14');
  });

  it('returns MUS1 for MUS sticker at global number 981', () => {
    // MUS starts at 981 (after FWC: 961-980)
    expect(formatSpecialCode('MUS', 981)).toBe('MUS1');
  });

  it('returns MUS11 for MUS sticker at global number 991', () => {
    expect(formatSpecialCode('MUS', 991)).toBe('MUS11');
  });

  it('returns FWC00 for FWC sticker at global number 961', () => {
    // FWC starts at 961, startPosition=0
    expect(formatSpecialCode('FWC', 961)).toBe('FWC00');
  });

  it('returns FWC19 for FWC sticker at global number 980', () => {
    expect(formatSpecialCode('FWC', 980)).toBe('FWC19');
  });

  it('returns #991 for unknown special_attribute (no range match)', () => {
    // 991 is MUS11, but with an unknown attribute it falls back
    expect(formatSpecialCode('UNKNOWN', 991)).toBe('#991');
  });

  it('returns raw global number for team stickers (no special attribute)', () => {
    // 960 is the last team sticker (48 × 20)
    expect(formatSpecialCode('', 960)).toBe('#960');
  });
});

describe('specialRanges lookup', () => {
  it('includes FWC with displayCode FWC and startPosition 0', () => {
    const fwc = specialRanges.find(r => r.attribute === 'FWC');
    expect(fwc).toBeDefined();
    expect(fwc!.displayCode).toBe('FWC');
    expect(fwc!.startPosition).toBe(0);
    expect(fwc!.count).toBe(20);
  });

  it('includes COC with displayCode CC', () => {
    const coc = specialRanges.find(r => r.attribute === 'COC');
    expect(coc).toBeDefined();
    expect(coc!.displayCode).toBe('CC');
    expect(coc!.startGlobal).toBe(992);
    expect(coc!.count).toBe(14);
  });

  it('includes MUS with displayCode MUS', () => {
    const mus = specialRanges.find(r => r.attribute === 'MUS');
    expect(mus).toBeDefined();
    expect(mus!.displayCode).toBe('MUS');
    expect(mus!.startGlobal).toBe(981);
    expect(mus!.count).toBe(11);
  });
});
