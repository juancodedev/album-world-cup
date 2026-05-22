import { Sticker } from '../entities/sticker.entity';

export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

export class RaritySpecification implements ISpecification<Sticker> {
  constructor(private readonly rarity: string) {}

  isSatisfiedBy(sticker: Sticker): boolean {
    return sticker.rarity.value === this.rarity;
  }
}

export class SpecialStickerSpecification implements ISpecification<Sticker> {
  isSatisfiedBy(sticker: Sticker): boolean {
    return sticker.isSpecial;
  }
}

export class TeamStickerSpecification implements ISpecification<Sticker> {
  constructor(private readonly teamId: string) {}

  isSatisfiedBy(sticker: Sticker): boolean {
    return sticker.teamId === this.teamId;
  }
}

export class AndSpecification<T> implements ISpecification<T> {
  constructor(private readonly specs: ISpecification<T>[]) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.specs.every(spec => spec.isSatisfiedBy(candidate));
  }
}

export class OrSpecification<T> implements ISpecification<T> {
  constructor(private readonly specs: ISpecification<T>[]) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.specs.some(spec => spec.isSatisfiedBy(candidate));
  }
}
