import { IOpportunityRequests } from '../interfaces/interface';

export abstract class BaseDataSource {
  public abstract init(): Promise<BaseDataSource>;

  public abstract getOpportunityRequestDetails(token: string, vendorid: string, host: string): Promise<IOpportunityRequests>;
}
