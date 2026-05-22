import { Player } from '../../domain/entities/player.entity';
import { PlayerDTO } from '../dtos/player.dto';

export class PlayerMapper {
  toDTO(player: Player, teamName?: string): PlayerDTO {
    return {
      id: player.id,
      teamId: player.teamId,
      teamName: teamName || '',
      name: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber || null,
      photoUrl: player.photoUrl || null,
      stats: player.stats || null,
    };
  }

  fromPersistence(raw: Record<string, unknown>): Player {
    return new Player({
      id: raw.id as string,
      teamId: raw.team_id as string,
      name: raw.name as string,
      position: raw.position as string,
      jerseyNumber: raw.jersey_number as number | undefined,
      photoUrl: raw.photo_url as string | undefined,
      stats: raw.stats as Record<string, unknown> | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }
}

export const playerMapper = new PlayerMapper();
