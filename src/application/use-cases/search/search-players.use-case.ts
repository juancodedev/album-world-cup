import { IPlayerRepository } from '../../../domain/repositories/player.repository';
import { PlayerDTO } from '../../dtos/player.dto';
import { playerMapper } from '../../mappers/player.mapper';

export class SearchPlayersUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(query: string): Promise<PlayerDTO[]> {
    const players = await this.playerRepository.search(query);
    return players.map(player => playerMapper.toDTO(player));
  }
}
