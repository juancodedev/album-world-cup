import { GenerateShareCodeUseCase } from '../use-cases/share/generate-share-code.use-case';
import { GetSharedCollectionUseCase } from '../use-cases/share/get-shared-collection.use-case';
import { UpdateShareSettingsUseCase } from '../use-cases/share/update-share-settings.use-case';
import { ShareCollectionDTO } from '../dtos/share-collection.dto';

export class ShareService {
  constructor(
    private readonly generateShareCodeUseCase: GenerateShareCodeUseCase,
    private readonly getSharedCollectionUseCase: GetSharedCollectionUseCase,
    private readonly updateShareSettingsUseCase: UpdateShareSettingsUseCase,
  ) {}

  async generateCode(accountId: string, userId: string): Promise<ShareCollectionDTO> {
    return this.generateShareCodeUseCase.execute(accountId, userId);
  }

  async getSharedCollection(code: string): Promise<ShareCollectionDTO> {
    return this.getSharedCollectionUseCase.execute(code);
  }

  async updateSettings(input: {
    accountId: string;
    userId: string;
    isPublic?: boolean;
    showDuplicates?: boolean;
    showMissing?: boolean;
  }): Promise<ShareCollectionDTO> {
    return this.updateShareSettingsUseCase.execute(input);
  }
}
