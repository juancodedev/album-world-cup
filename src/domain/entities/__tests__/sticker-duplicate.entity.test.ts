import { StickerDuplicate } from '../sticker-duplicate.entity'

describe('StickerDuplicate', () => {
  it('creates with initial quantity', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 3)
    expect(dup.quantity).toBe(3)
  })

  it('defaults quantity to 1', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1')
    expect(dup.quantity).toBe(1)
  })

  it('increments quantity', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 1)
    dup.increment(2)
    expect(dup.quantity).toBe(3)
  })

  it('increments by 1 by default', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 1)
    dup.increment()
    expect(dup.quantity).toBe(2)
  })

  it('decrements quantity', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 5)
    dup.decrement(2)
    expect(dup.quantity).toBe(3)
  })

  it('decrements by 1 by default', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 5)
    dup.decrement()
    expect(dup.quantity).toBe(4)
  })

  it('throws when decrementing below 0', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 1)
    expect(() => dup.decrement(2)).toThrow('Cannot have negative duplicates')
  })

  it('updates timestamps on mutation', () => {
    const dup = StickerDuplicate.create('account-1', 'user-1', 'sticker-1', 1)
    const before = dup.updatedAt.getTime()
    dup.increment()
    expect(dup.updatedAt.getTime()).toBeGreaterThanOrEqual(before)
  })
})
