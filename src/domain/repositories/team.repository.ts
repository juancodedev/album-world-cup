import { Team } from '../entities/team.entity';

export interface TeamFilters {
  albumId?: string;
  confederationId?: string;
}

export interface ITeamRepository {
  getById(id: string): Promise<Team | null>;
  getAll(filters?: TeamFilters): Promise<Team[]>;
  getByAlbum(albumId: string): Promise<Team[]>;
  save(team: Team): Promise<void>;
}
