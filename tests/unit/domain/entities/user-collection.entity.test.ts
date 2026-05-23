import { UserCollection } from '../../../../src/domain/entities/user-collection.entity';

describe('UserCollection', () => {
  describe('create', () => {
    it('should create a new user collection with quantity of 1', () => {
      const collection = UserCollection.create('account-1', 'user-1', 'sticker-1');

      expect(collection.accountId).toBe('account-1');
      expect(collection.userId).toBe('user-1');
      expect(collection.stickerId).toBe('sticker-1');
      expect(collection.quantityOwned).toBe(1);
      expect(collection.obtainedAt).toBeInstanceOf(Date);
    });
  });

  describe('incrementQuantity', () => {
    it('should increment quantity by 1', () => {
      const collection = UserCollection.create('account-1', 'user-1', 'sticker-1');
      collection.incrementQuantity();
      expect(collection.quantityOwned).toBe(2);
    });

    it('should update updatedAt timestamp', () => {
      const collection = UserCollection.create('account-1', 'user-1', 'sticker-1');
      const oldUpdatedAt = collection.updatedAt;
      collection.incrementQuantity();
      expect(collection.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('decrementQuantity', () => {
    it('should decrement quantity by 1', () => {
      const collection = new UserCollection({
        accountId: 'account-1',
        userId: 'user-1',
        stickerId: 'sticker-1',
        quantityOwned: 2,
      });
      collection.decrementQuantity();
      expect(collection.quantityOwned).toBe(1);
    });

    it('should throw error when trying to decrement below 1', () => {
      const collection = UserCollection.create('account-1', 'user-1', 'sticker-1');
      expect(() => collection.decrementQuantity()).toThrow('Cannot decrement below 1');
    });
  });
});
