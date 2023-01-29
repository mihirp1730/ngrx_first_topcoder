import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { SplitFactory } from '@splitsoftware/splitio';
import * as SplitIO from '@splitsoftware/splitio/types/splitio';

export enum Features {
  showExperimentalLayers = 'SHOW_EXPERIMENTAL_LAYERS',
  sauthClaimChanges = 'SAUTH_CLAIM_CHANGES'
}

@Injectable()
@GaiaTraceClass
export class FeatureFlagService implements OnModuleDestroy {
  private splitClient: SplitIO.IClient;
  public sdkReady = false;

  constructor(splitioNodejsKey: string) {
    this.initializeSDK(splitioNodejsKey);
  }

  onModuleDestroy() {
    if (this.splitClient) {
      this.splitClient.destroy();
      this.splitClient = null;
    }
  }

  private initializeSDK(splitioNodejsKey: string): void {
    let factory: SplitIO.ISDK;

    if (splitioNodejsKey === 'localhost') {
      factory = SplitFactory({
        core: {
          authorizationKey: 'localhost'
        },
        features: 'libs/server/feature-flag/src/lib/split.yaml',
        scheduler: {
          offlineRefreshRate: 15
        }
      });
    } else {
      factory = SplitFactory({
        core: {
          authorizationKey: splitioNodejsKey
        },
        storage: {
          type: 'MEMORY',
          prefix: 'SPLITIO'
        },
        scheduler: {
          featuresRefreshRate: 60,
          segmentsRefreshRate: 60
        }
      });
    }

    this.splitClient = factory.client();
    this.splitClient.on(this.splitClient.Event.SDK_READY, () => {
      this.sdkReady = true;
    });
  }

  public getTreatment(subid: string, feature: Features, dataPartitionId?: string): boolean {
    if (this.sdkReady) {
      const treatment: SplitIO.Treatment = dataPartitionId
        ? this.splitClient.getTreatment(subid, feature, {
            datapartition: dataPartitionId
          })
        : this.splitClient.getTreatment(subid, feature);

      return this.convertTreatment(treatment);
    } else {
      return false;
    }
  }

  public getFeatureFlag(featureFlag: Features, subid: string, dataPartitionId?: string): boolean {
    try {
      return this.getTreatment(subid, featureFlag, dataPartitionId);
    } catch (e) {
      return false;
    }
  }

  private convertTreatment(treatment: string): boolean {
    return treatment.startsWith('on');
  }
}
