import { createClient } from '../infrastructure/database/supabase.client';
import { SupabaseUserCollectionRepository } from '../infrastructure/repositories/supabase-user-collection.repository';
import { SupabaseStickerRepository } from '../infrastructure/repositories/supabase-sticker.repository';
import { SupabaseTeamRepository } from '../infrastructure/repositories/supabase-team.repository';
import { SupabasePlayerRepository } from '../infrastructure/repositories/supabase-player.repository';
import { SupabaseAlbumRepository } from '../infrastructure/repositories/supabase-album.repository';
import { SupabaseUserRepository } from '../infrastructure/repositories/supabase-user.repository';
import { SupabaseStickerDuplicateRepository } from '../infrastructure/repositories/supabase-sticker-duplicate.repository';
import { SupabaseShareCollectionRepository } from '../infrastructure/repositories/supabase-share-collection.repository';
import { SupabaseAccountRepository } from '../infrastructure/repositories/supabase-account.repository';
import { SupabaseAccountMemberRepository } from '../infrastructure/repositories/supabase-account-member.repository';

import { AddStickerUseCase } from '../application/use-cases/collection/add-sticker.use-case';
import { IncrementDuplicateUseCase } from '../application/use-cases/collection/increment-duplicate.use-case';
import { RemoveDuplicateUseCase } from '../application/use-cases/collection/remove-duplicate.use-case';
import { GetUserCollectionUseCase } from '../application/use-cases/collection/get-user-collection.use-case';
import { GetCollectionStatsUseCase } from '../application/use-cases/collection/get-collection-stats.use-case';
import { SearchStickersUseCase } from '../application/use-cases/search/search-stickers.use-case';
import { SearchPlayersUseCase } from '../application/use-cases/search/search-players.use-case';
import { SearchTeamsUseCase } from '../application/use-cases/search/search-teams.use-case';
import { GenerateShareCodeUseCase } from '../application/use-cases/share/generate-share-code.use-case';
import { GetSharedCollectionUseCase } from '../application/use-cases/share/get-shared-collection.use-case';
import { UpdateShareSettingsUseCase } from '../application/use-cases/share/update-share-settings.use-case';
import { GetAllStickersUseCase } from '../application/use-cases/sticker/get-all-stickers.use-case';
import { GetStickerDetailsUseCase } from '../application/use-cases/sticker/get-sticker-details.use-case';
import { GetAllAlbumsUseCase } from '../application/use-cases/album/get-all-albums.use-case';
import { GetAlbumByIdUseCase } from '../application/use-cases/album/get-album-by-id.use-case';
import { LoginWithGoogleUseCase } from '../application/use-cases/auth/login-with-google.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { CreateAccountUseCase } from '../application/use-cases/account/create-account.use-case';
import { GetUserAccountsUseCase } from '../application/use-cases/account/get-user-accounts.use-case';
import { InviteMemberUseCase } from '../application/use-cases/account/invite-member.use-case';

import { CollectionService } from '../application/services/collection.service';
import { SearchService } from '../application/services/search.service';
import { StatisticsService } from '../application/services/statistics.service';
import { ShareService } from '../application/services/share.service';
import { AuthService } from '../application/services/auth.service';

import { CollectionMapper } from '../application/mappers/collection.mapper';
import { albumMapper } from '../application/mappers/album.mapper';
import { teamMapper } from '../application/mappers/team.mapper';
import { playerMapper } from '../application/mappers/player.mapper';
import { shareCollectionMapper } from '../application/mappers/share-collection.mapper';

class DIContainer {
  private instances = new Map<string, unknown>();
  private supabaseClient: ReturnType<typeof createClient> | null = null;

  getSupabaseClient() {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient();
    }
    return this.supabaseClient;
  }

  // Repositories
  getUserCollectionRepository() {
    return this.getInstance('userCollectionRepo', () =>
      new SupabaseUserCollectionRepository(this.getSupabaseClient()));
  }

  getStickerRepository() {
    return this.getInstance('stickerRepo', () =>
      new SupabaseStickerRepository(this.getSupabaseClient()));
  }

  getTeamRepository() {
    return this.getInstance('teamRepo', () =>
      new SupabaseTeamRepository(this.getSupabaseClient()));
  }

  getPlayerRepository() {
    return this.getInstance('playerRepo', () =>
      new SupabasePlayerRepository(this.getSupabaseClient()));
  }

  getAlbumRepository() {
    return this.getInstance('albumRepo', () =>
      new SupabaseAlbumRepository(this.getSupabaseClient()));
  }

  getUserRepository() {
    return this.getInstance('userRepo', () =>
      new SupabaseUserRepository(this.getSupabaseClient()));
  }

  getStickerDuplicateRepository() {
    return this.getInstance('duplicateRepo', () =>
      new SupabaseStickerDuplicateRepository(this.getSupabaseClient()));
  }

  getShareCollectionRepository() {
    return this.getInstance('shareRepo', () =>
      new SupabaseShareCollectionRepository(this.getSupabaseClient()));
  }

  getAccountRepository() {
    return this.getInstance('accountRepo', () =>
      new SupabaseAccountRepository(this.getSupabaseClient()));
  }

  getAccountMemberRepository() {
    return this.getInstance('accountMemberRepo', () =>
      new SupabaseAccountMemberRepository(this.getSupabaseClient()));
  }

  // Use Cases
  getAddStickerUseCase() {
    return this.getInstance('addSticker', () =>
      new AddStickerUseCase(
        this.getUserCollectionRepository(),
        this.getStickerRepository(),
        new CollectionMapper(),
      ));
  }

  getIncrementDuplicateUseCase() {
    return this.getInstance('incrementDuplicate', () =>
      new IncrementDuplicateUseCase(
        this.getStickerDuplicateRepository(),
        this.getStickerRepository(),
      ));
  }

  getRemoveDuplicateUseCase() {
    return this.getInstance('removeDuplicate', () =>
      new RemoveDuplicateUseCase(this.getStickerDuplicateRepository()));
  }

  getGetUserCollectionUseCase() {
    return this.getInstance('getUserCollection', () =>
      new GetUserCollectionUseCase(
        this.getUserCollectionRepository(),
        this.getStickerRepository(),
        this.getStickerDuplicateRepository(),
      ));
  }

  getGetCollectionStatsUseCase() {
    return this.getInstance('getCollectionStats', () =>
      new GetCollectionStatsUseCase(
        this.getUserCollectionRepository(),
        this.getStickerDuplicateRepository(),
        this.getStickerRepository(),
        this.getAlbumRepository(),
      ));
  }

  getSearchStickersUseCase() {
    return this.getInstance('searchStickers', () =>
      new SearchStickersUseCase(this.getStickerRepository()));
  }

  getSearchPlayersUseCase() {
    return this.getInstance('searchPlayers', () =>
      new SearchPlayersUseCase(this.getPlayerRepository()));
  }

  getSearchTeamsUseCase() {
    return this.getInstance('searchTeams', () =>
      new SearchTeamsUseCase(this.getTeamRepository()));
  }

  getGenerateShareCodeUseCase() {
    return this.getInstance('generateShareCode', () =>
      new GenerateShareCodeUseCase(this.getShareCollectionRepository()));
  }

  getGetSharedCollectionUseCase() {
    return this.getInstance('getSharedCollection', () =>
      new GetSharedCollectionUseCase(
        this.getShareCollectionRepository(),
        this.getUserCollectionRepository(),
        this.getStickerRepository(),
        this.getUserRepository(),
      ));
  }

  getUpdateShareSettingsUseCase() {
    return this.getInstance('updateShareSettings', () =>
      new UpdateShareSettingsUseCase(this.getShareCollectionRepository()));
  }

  getGetAllStickersUseCase() {
    return this.getInstance('getAllStickers', () =>
      new GetAllStickersUseCase(this.getStickerRepository()));
  }

  getGetStickerDetailsUseCase() {
    return this.getInstance('getStickerDetails', () =>
      new GetStickerDetailsUseCase(
        this.getStickerRepository(),
        this.getPlayerRepository(),
        this.getTeamRepository(),
        this.getAlbumRepository(),
        this.getUserCollectionRepository(),
        this.getStickerDuplicateRepository(),
      ));
  }

  getGetAllAlbumsUseCase() {
    return this.getInstance('getAllAlbums', () =>
      new GetAllAlbumsUseCase(this.getAlbumRepository()));
  }

  getGetAlbumByIdUseCase() {
    return this.getInstance('getAlbumById', () =>
      new GetAlbumByIdUseCase(this.getAlbumRepository()));
  }

  getLoginWithGoogleUseCase() {
    return this.getInstance('loginGoogle', () =>
      new LoginWithGoogleUseCase(this.getUserRepository()));
  }

  getLogoutUseCase() {
    return this.getInstance('logout', () => new LogoutUseCase());
  }

  getCreateAccountUseCase() {
    return this.getInstance('createAccount', () =>
      new CreateAccountUseCase(
        this.getAccountRepository(),
        this.getAccountMemberRepository(),
      ));
  }

  getGetUserAccountsUseCase() {
    return this.getInstance('getUserAccounts', () =>
      new GetUserAccountsUseCase(
        this.getAccountRepository(),
        this.getAccountMemberRepository(),
      ));
  }

  getInviteMemberUseCase() {
    return this.getInstance('inviteMember', () =>
      new InviteMemberUseCase(
        this.getAccountMemberRepository(),
        this.getUserRepository(),
      ));
  }

  // Services
  getCollectionService() {
    return this.getInstance('collectionService', () =>
      new CollectionService(
        this.getAddStickerUseCase(),
        this.getIncrementDuplicateUseCase(),
        this.getRemoveDuplicateUseCase(),
        this.getGetUserCollectionUseCase(),
        this.getGetCollectionStatsUseCase(),
      ));
  }

  getSearchService() {
    return this.getInstance('searchService', () =>
      new SearchService(
        this.getSearchStickersUseCase(),
        this.getSearchPlayersUseCase(),
        this.getSearchTeamsUseCase(),
      ));
  }

  getStatisticsService() {
    return this.getInstance('statsService', () =>
      new StatisticsService(
        this.getUserCollectionRepository(),
        this.getStickerDuplicateRepository(),
        this.getStickerRepository(),
        this.getAlbumRepository(),
      ));
  }

  getShareService() {
    return this.getInstance('shareService', () =>
      new ShareService(
        this.getGenerateShareCodeUseCase(),
        this.getGetSharedCollectionUseCase(),
        this.getUpdateShareSettingsUseCase(),
      ));
  }

  getAuthService() {
    return this.getInstance('authService', () =>
      new AuthService(
        this.getLoginWithGoogleUseCase(),
        this.getLogoutUseCase(),
      ));
  }

  private getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }
}

export const container = new DIContainer();
