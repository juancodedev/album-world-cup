export interface TeamProps {
  id?: string;
  albumId: string;
  confederationId: string;
  name: string;
  code: string;
  flagUrl?: string;
  groupStage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Team {
  public readonly id: string;
  public readonly albumId: string;
  public readonly confederationId: string;
  public readonly name: string;
  public readonly code: string;
  public readonly flagUrl?: string;
  public readonly groupStage?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: TeamProps) {
    this.id = props.id || crypto.randomUUID();
    this.albumId = props.albumId;
    this.confederationId = props.confederationId;
    this.name = props.name;
    this.code = props.code;
    this.flagUrl = props.flagUrl;
    this.groupStage = props.groupStage;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(props: Omit<TeamProps, 'id' | 'createdAt' | 'updatedAt'>): Team {
    return new Team(props);
  }
}
