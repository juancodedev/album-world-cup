import { ITeamRepository } from '../../../domain/repositories/team.repository';
import { TeamDTO } from '../../dtos/team.dto';
import { teamMapper } from '../../mappers/team.mapper';

export class SearchTeamsUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(query: string): Promise<TeamDTO[]> {
    const allTeams = await this.teamRepository.getAll();
    const filtered = allTeams.filter(team =>
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.code.toLowerCase().includes(query.toLowerCase()),
    );
    return filtered.map(team => teamMapper.toDTO(team));
  }
}
