import { Sticker } from '../sticker.entity'

describe('Sticker', () => {
  const defaultProps = {
    albumId: 'album-1',
    number: 1,
    stickerTypeId: 'type-1',
    rarity: 'common' as const,
    imageUrl: 'https://example.com/sticker1.jpg',
    isSpecial: false,
  }

  it('creates with given props', () => {
    const sticker = new Sticker(defaultProps)
    expect(sticker.number).toBe(1)
    expect(sticker.rarity.value).toBe('common')
  })

  it('generates id if not provided', () => {
    const sticker = new Sticker(defaultProps)
    expect(sticker.id).toBeDefined()
  })

  it('uses provided id', () => {
    const sticker = new Sticker({ ...defaultProps, id: 'custom-id' })
    expect(sticker.id).toBe('custom-id')
  })

  it('creates special sticker', () => {
    const sticker = new Sticker({
      ...defaultProps,
      isSpecial: true,
      specialAttribute: 'golden',
    })
    expect(sticker.isSpecial).toBe(true)
    expect(sticker.specialAttribute).toBe('golden')
  })

  it('returns display name with number', () => {
    const sticker = new Sticker(defaultProps)
    expect(sticker.displayName).toBe('#1')
  })

  it('handles player and team associations', () => {
    const sticker = new Sticker({
      ...defaultProps,
      playerId: 'player-1',
      teamId: 'team-1',
    })
    expect(sticker.playerId).toBe('player-1')
    expect(sticker.teamId).toBe('team-1')
  })

  it('static create sets default dates', () => {
    const sticker = Sticker.create({
      albumId: 'album-1',
      number: 5,
      stickerTypeId: 'type-1',
      rarity: 'rare',
      imageUrl: 'https://example.com/sticker5.jpg',
      isSpecial: false,
    })
    expect(sticker).toBeInstanceOf(Sticker)
    expect(sticker.rarity.value).toBe('rare')
  })
})
