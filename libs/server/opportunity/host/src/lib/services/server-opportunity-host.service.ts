import { Injectable } from '@nestjs/common';
import { IOpportunityRequests } from '../interfaces/interface';
import { BaseDataSource } from '../providers/base.data-source';

@Injectable()
export class ServerOpportunityHostService {
  constructor(public readonly baseDataSource: BaseDataSource) {}

  public getOpportunitySubscriptionRequests(token: string, vendorid: string, host: string): Promise<IOpportunityRequests> {
    return this.baseDataSource.getOpportunityRequestDetails(token, vendorid, host);
  }
}
