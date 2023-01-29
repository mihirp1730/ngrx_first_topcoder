import { DataPackage, DataPackageStatus, DataPackageStatusState } from '@apollo/api/data-packages/consumer';
import { GaiaAdviseClass } from '@apollo/server/aspect-logger';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

import { BaseConsumerDataSource } from '../providers/consumer-data-source';

@Injectable()
@GaiaAdviseClass()
@GaiaTraceClass
export class ServerDataPackagesConsumerService {

  constructor(public readonly baseConsumerDataSource: BaseConsumerDataSource) {
  }

  public async getDataPackage(
    dataPackageId: string
  ): Promise<DataPackage> {
    const subscription = await this.baseConsumerDataSource.queryDataPackageSubscription(dataPackageId);
    return {
      dataPackageId,
      subscription,
      name: '',
      dataPackageStatus: DataPackageStatus.Published,
      dataPackageStatusState: DataPackageStatusState.Success,
      dataPackageProfile: {
        dataPackageProfileId: '',
        profile: {
          regions: [],
          overview: {
            overView: '',
            keyPoints: []
          },
          featuresAndContents: {
            keyPoints: []
          },
          media: [],
          documents: [],
          opportunity: {
            opportunity: ''
          }
        },
        price: {
          price: 0,
          onRequest: false,
          durationTerm: 0
        }
      },
      vendorId: ''
    };
  }

}
