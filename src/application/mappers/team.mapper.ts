import { Team } from '../../domain/entities/team.entity';
import { TeamDTO } from '../dtos/team.dto';

export class TeamMapper {
  toDTO(team: Team, context?: {
    confederationName?: string;
    stickerCount?: number;
    ownedCount?: number;
  }): TeamDTO {
    return {
      id: team.id,
      albumId: team.albumId,
      confederationId: team.confederationId,
      confederationName: context?.confederationName || '',
      name: team.name,
      code: team.code,
      flagUrl: team.flagUrl || null,
      groupStage: team.groupStage || null,
      stickerCount: context?.stickerCount || 0,
      ownedCount: context?.ownedCount || 0,
      progressPercentage: context?.stickerCount
        ? Math.round(((context?.ownedCount || 0) / context.stickerCount) * 100)
        : 0,
    };
  }

  fromPersistence(raw: Record<string, unknown>): Team {
    return new Team({
      id: raw.id as string,
      albumId: raw.album_id as string,
      confederationId: raw.confederation_id as string,
      name: raw.name as string,
      code: raw.code as string,
      flagUrl: raw.flag_url as string | undefined,
      groupStage: raw.group_stage as string | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  toPersistence(team: Team): Record<string, unknown> {
    return {
      id: team.id,
      album_id: team.albumId,
      confederation_id: team.confederationId,
      name: team.name,
      code: team.code,
      flag_url: team.flagUrl || null,
      group_stage: team.groupStage || null,
    };
  }
}

export const teamMapper = new TeamMapper();
