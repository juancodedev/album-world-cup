import { Rarity, RarityValue } from '../value-objects/rarity.vo';
import { StickerType } from '../value-objects/sticker-type.vo';

export interface StickerProps {
  id?: string;
  albumId: string;
  number: number;
  playerId?: string;
  teamId?: string;
  stickerTypeId: string;
  rarity: RarityValue;
  imageUrl: string;
  imageThumbnail?: string;
  isSpecial: boolean;
  specialAttribute?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sticker {
  public readonly id: string;
  public readonly albumId: string;
  public readonly number: number;
  public readonly playerId?: string;
  public readonly teamId?: string;
  public readonly stickerTypeId: string;
  public readonly rarity: Rarity;
  public readonly imageUrl: string;
  public readonly imageThumbnail?: string;
  public readonly isSpecial: boolean;
  public readonly specialAttribute?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: StickerProps) {
    this.id = props.id || crypto.randomUUID();
    this.albumId = props.albumId;
    this.number = props.number;
    this.playerId = props.playerId;
    this.teamId = props.teamId;
    this.stickerTypeId = props.stickerTypeId;
    this.rarity = Rarity.create(props.rarity);
    this.imageUrl = props.imageUrl;
    this.imageThumbnail = props.imageThumbnail;
    this.isSpecial = props.isSpecial;
    this.specialAttribute = props.specialAttribute;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  get displayName(): string {
    return `#${this.number}`;
  }

  static create(props: Omit<StickerProps, 'id' | 'createdAt' | 'updatedAt'>): Sticker {
    return new Sticker(props);
  }
}
