export interface AlbumProps {
  id?: string;
  name: string;
  year: number;
  tournamentType: string;
  description?: string;
  imageUrl?: string;
  totalStickers: number;
  specialStickers: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Album {
  public readonly id: string;
  public readonly name: string;
  public readonly year: number;
  public readonly tournamentType: string;
  public readonly description?: string;
  public readonly imageUrl?: string;
  public readonly totalStickers: number;
  public readonly specialStickers: number;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AlbumProps) {
    this.id = props.id || crypto.randomUUID();
    this.name = props.name;
    this.year = props.year;
    this.tournamentType = props.tournamentType;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.totalStickers = props.totalStickers;
    this.specialStickers = props.specialStickers;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  get completionPercentage(): number {
    return this.totalStickers > 0 ? 0 : 0;
  }

  static create(props: Omit<AlbumProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Album {
    return new Album({ ...props, isActive: true });
  }
}
