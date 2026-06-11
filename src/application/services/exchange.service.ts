import { CreateExchangeOfferUseCase } from '../use-cases/exchange/create-exchange-offer.use-case';
import { AcceptExchangeOfferUseCase } from '../use-cases/exchange/accept-exchange-offer.use-case';
import { CancelExchangeOfferUseCase } from '../use-cases/exchange/cancel-exchange-offer.use-case';
import { GetPendingExchangeOffersUseCase } from '../use-cases/exchange/get-pending-exchange-offers.use-case';
import { GetUserExchangeOffersUseCase } from '../use-cases/exchange/get-user-exchange-offers.use-case';
import { ExchangeOffer } from '../../domain/entities/exchange-offer.entity';

export class ExchangeService {
  constructor(
    private readonly createExchangeOfferUseCase: CreateExchangeOfferUseCase,
    private readonly acceptExchangeOfferUseCase: AcceptExchangeOfferUseCase,
    private readonly cancelExchangeOfferUseCase: CancelExchangeOfferUseCase,
    private readonly getPendingExchangeOffersUseCase: GetPendingExchangeOffersUseCase,
    private readonly getUserExchangeOffersUseCase: GetUserExchangeOffersUseCase,
  ) {}

  async createOffer(input: {
    fromUserId: string;
    fromAccountId: string;
    offeredStickerId: string;
    requestedStickerId?: string;
    message?: string;
  }): Promise<ExchangeOffer> {
    return this.createExchangeOfferUseCase.execute(input);
  }

  async acceptOffer(input: {
    offerId: string;
    acceptedByUserId: string;
    acceptedByAccountId: string;
  }): Promise<void> {
    return this.acceptExchangeOfferUseCase.execute(input);
  }

  async cancelOffer(offerId: string, userId: string): Promise<void> {
    return this.cancelExchangeOfferUseCase.execute(offerId, userId);
  }

  async getPendingOffers(excludeUserId?: string): Promise<ExchangeOffer[]> {
    return this.getPendingExchangeOffersUseCase.execute(excludeUserId);
  }

  async getUserOffers(userId: string): Promise<ExchangeOffer[]> {
    return this.getUserExchangeOffersUseCase.execute(userId);
  }
}
