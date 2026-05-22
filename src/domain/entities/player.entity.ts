export interface PlayerProps {
  id?: string;
  teamId: string;
  name: string;
  position: string;
  jerseyNumber?: number;
  photoUrl?: string;
  stats?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Player {
  public readonly id: string;
  public readonly teamId: string;
  public readonly name: string;
  public readonly position: string;
  public readonly jerseyNumber?: number;
  public readonly photoUrl?: string;
  public readonly stats?: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: PlayerProps) {
    this.id = props.id || crypto.randomUUID();
    this.teamId = props.teamId;
    this.name = props.name;
    this.position = props.position;
    this.jerseyNumber = props.jerseyNumber;
    this.photoUrl = props.photoUrl;
    this.stats = props.stats;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(props: Omit<PlayerProps, 'id' | 'createdAt' | 'updatedAt'>): Player {
    return new Player(props);
  }
}
