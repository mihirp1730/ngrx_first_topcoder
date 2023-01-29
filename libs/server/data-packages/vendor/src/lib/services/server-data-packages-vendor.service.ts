import { FilterRequest, ResultsResponse } from '@apollo/api/data-packages/vendor';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

import { BaseDataSource } from '../providers/data-source';

@Injectable()
@GaiaTraceClass
export class ServerDataPackagesVendorService {

  constructor(
    public readonly baseDataSource: BaseDataSource
  ) {
  }

  public async queryResults(
    userId: string,
    billingAccountId: string,
    authorization: string,
    filter: FilterRequest
  ): Promise<ResultsResponse> {
    const results = await this.baseDataSource.queryPackages(userId, billingAccountId, authorization, filter);
    return {
      totalResults: results.length,
      results
    };
  }

}
