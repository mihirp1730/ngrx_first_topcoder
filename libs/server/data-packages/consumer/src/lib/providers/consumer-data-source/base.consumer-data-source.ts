import { DataPackageSubscription } from '@apollo/api/data-packages/consumer';

export abstract class BaseConsumerDataSource {

  public abstract init(): Promise<BaseConsumerDataSource>;

  public abstract queryDataPackageSubscription(
    dataPackageId: string
  ): Promise<DataPackageSubscription>;

}
