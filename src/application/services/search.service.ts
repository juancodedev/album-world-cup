import { SearchStickersUseCase } from '../use-cases/search/search-stickers.use-case';
import { SearchPlayersUseCase } from '../use-cases/search/search-players.use-case';
import { SearchTeamsUseCase } from '../use-cases/search/search-teams.use-case';
import { StickerDTO } from '../dtos/sticker.dto';
import { PlayerDTO } from '../dtos/player.dto';
import { TeamDTO } from '../dtos/team.dto';

export class SearchService {
  constructor(
    private readonly searchStickers: SearchStickersUseCase,
    private readonly searchPlayers: SearchPlayersUseCase,
    private readonly searchTeams: SearchTeamsUseCase,
  ) {}

  async searchAll(query: string): Promise<{
    stickers: StickerDTO[];
    players: PlayerDTO[];
    teams: TeamDTO[];
  }> {
    const [stickers, players, teams] = await Promise.all([
      this.searchStickers.execute({ search: query }),
      this.searchPlayers.execute(query),
      this.searchTeams.execute(query),
    ]);

    return { stickers, players, teams };
  }

  async searchStickersByFilters(filters: {
    search?: string;
    albumId?: string;
    rarity?: string;
    teamId?: string;
    isSpecial?: boolean;
  }): Promise<StickerDTO[]> {
    return this.searchStickers.execute(filters);
  }
}
