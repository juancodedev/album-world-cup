import { Player } from '../entities/player.entity';

export interface PlayerFilters {
  teamId?: string;
  search?: string;
}

export interface IPlayerRepository {
  getById(id: string): Promise<Player | null>;
  getAll(filters?: PlayerFilters): Promise<Player[]>;
  getByTeam(teamId: string): Promise<Player[]>;
  search(query: string): Promise<Player[]>;
  save(player: Player): Promise<void>;
}
