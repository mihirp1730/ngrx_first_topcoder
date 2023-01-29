import { DataPackageSubscription, DataPackageSubscriptionStatus } from '@apollo/api/data-packages/consumer';
import { GaiaTraceClass } from '@apollo/tracer';

import { BaseConsumerDataSource } from './base.consumer-data-source';

/* istanbul ignore next */
@GaiaTraceClass
export class InMemoryConsumerDataSource extends BaseConsumerDataSource {

  public async init(): Promise<BaseConsumerDataSource> {
    return this;
  }

  public async queryDataPackageSubscription(): Promise<DataPackageSubscription> {
    return {
      status: DataPackageSubscriptionStatus.Void,
      subscriptionStartTime: '2021-12-00T11:08:21.21+00:00',
      subscriptionEndTime: '2022-12-00T11:08:21.21+00:00',
      lastRequestTime: '2021-08-03T11:08:21.21+00:00'
    }
  }
}
