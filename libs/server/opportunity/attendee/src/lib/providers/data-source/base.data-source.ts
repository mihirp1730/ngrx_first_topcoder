import { Request } from 'express';
import { IOpportunityDetails } from '../../interfaces/interface';

export abstract class BaseDataSource {
  public abstract init(): Promise<BaseDataSource>;

  public abstract getOpportunityDetails(
    authorization: string,
    userId: string,
    opportunityId: string,
    request: Request
  ): Promise<IOpportunityDetails>;
}
