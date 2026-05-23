import { Rarity } from '../rarity.vo'

describe('Rarity', () => {
  it('creates valid rarities', () => {
    expect(Rarity.create('common').value).toBe('common')
    expect(Rarity.create('rare').value).toBe('rare')
    expect(Rarity.create('legendary').value).toBe('legendary')
    expect(Rarity.create('holographic').value).toBe('holographic')
    expect(Rarity.create('limited').value).toBe('limited')
  })

  it('throws for invalid rarity', () => {
    expect(() => Rarity.create('invalid')).toThrow('Invalid rarity')
  })

  it('returns correct labels', () => {
    expect(Rarity.create('common').label).toBe('Común')
    expect(Rarity.create('rare').label).toBe('Rara')
    expect(Rarity.create('legendary').label).toBe('Legendaria')
  })

  it('returns correct colors', () => {
    expect(Rarity.create('common').color).toBe('#8b8b8b')
    expect(Rarity.create('rare').color).toBe('#4f46e5')
  })

  it('compares equality', () => {
    expect(Rarity.create('common').equals(Rarity.create('common'))).toBe(true)
    expect(Rarity.create('common').equals(Rarity.create('rare'))).toBe(false)
  })

  it('is immutable', () => {
    const rarity = Rarity.create('common')
    expect(Object.isFrozen(rarity)).toBe(true)
  })
})
