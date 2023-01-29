import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { IOpportunityDetails } from '../interfaces/interface';
import { BaseDataSource } from '../providers/data-source';

@Injectable()
export class ServerOpportunityAttendeeService {
  constructor(public readonly baseDataSource: BaseDataSource) {}

  public async getOpportunity(
    authorization: string,
    userId: string,
    opportunityId: string,
    request: Request
  ): Promise<IOpportunityDetails> {
    const details = await this.baseDataSource.getOpportunityDetails(authorization, userId, opportunityId, request);
    return details;
  }
}
