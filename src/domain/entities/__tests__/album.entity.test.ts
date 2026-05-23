import { Album } from '../album.entity'

describe('Album', () => {
  const defaultProps = {
    name: 'World Cup 2026',
    year: 2026,
    tournamentType: 'world_cup',
    totalStickers: 100,
    specialStickers: 10,
    isActive: true,
  }

  it('creates with given props', () => {
    const album = new Album(defaultProps)
    expect(album.name).toBe('World Cup 2026')
    expect(album.year).toBe(2026)
    expect(album.totalStickers).toBe(100)
    expect(album.specialStickers).toBe(10)
  })

  it('generates id if not provided', () => {
    const album = new Album(defaultProps)
    expect(album.id).toBeDefined()
    expect(typeof album.id).toBe('string')
  })

  it('uses provided id', () => {
    const album = new Album({ ...defaultProps, id: 'custom-id' })
    expect(album.id).toBe('custom-id')
  })

  it('sets dates on creation', () => {
    const now = new Date()
    const album = new Album(defaultProps)
    expect(album.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000)
    expect(album.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000)
  })

  it('static create sets isActive to true', () => {
    const album = Album.create({
      name: 'Euro 2028',
      year: 2028,
      tournamentType: 'euro',
      totalStickers: 50,
      specialStickers: 5,
    })
    expect(album.isActive).toBe(true)
  })

  it('accepts different sticker counts per album', () => {
    const small = new Album({ ...defaultProps, totalStickers: 50 })
    const large = new Album({ ...defaultProps, totalStickers: 638 })
    expect(small.totalStickers).toBe(50)
    expect(large.totalStickers).toBe(638)
  })
})
