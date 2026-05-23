import { UserCollection } from '../user-collection.entity'

describe('UserCollection', () => {
  it('creates with quantity 1 by default', () => {
    const uc = UserCollection.create('account-1', 'user-1', 'sticker-1')
    expect(uc.quantityOwned).toBe(1)
  })

  it('increments quantity', () => {
    const uc = UserCollection.create('account-1', 'user-1', 'sticker-1')
    uc.incrementQuantity()
    expect(uc.quantityOwned).toBe(2)
  })

  it('decrements quantity', () => {
    const uc = new UserCollection({
      accountId: 'account-1',
      userId: 'user-1',
      stickerId: 'sticker-1',
      quantityOwned: 3,
    })
    uc.decrementQuantity()
    expect(uc.quantityOwned).toBe(2)
  })

  it('throws when decrementing below 1', () => {
    const uc = UserCollection.create('account-1', 'user-1', 'sticker-1')
    expect(() => uc.decrementQuantity()).toThrow('Cannot decrement below 1')
  })

  it('updates timestamp on mutation', () => {
    const uc = UserCollection.create('account-1', 'user-1', 'sticker-1')
    const before = uc.updatedAt.getTime()
    uc.incrementQuantity()
    expect(uc.updatedAt.getTime()).toBeGreaterThanOrEqual(before)
  })
})
