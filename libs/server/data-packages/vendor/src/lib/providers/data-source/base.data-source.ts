import { FilterRequest, ResultsResponseResult } from '@apollo/api/data-packages/vendor';

export abstract class BaseDataSource {

  public abstract init(): Promise<BaseDataSource>;

  public abstract queryPackages(
    userId: string,
    billingAccountId: string,
    authorization: string,
    filter: FilterRequest
  ): Promise<ResultsResponseResult[]>;

}
