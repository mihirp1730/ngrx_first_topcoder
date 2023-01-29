import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import * as SplitIO from '@splitsoftware/splitio/types/splitio';
import { get } from 'lodash';
import { BehaviorSubject, fromEvent, merge, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

export enum FeaturesEnum {
  gisLayerConfigService = 'GIS_LAYER_CONFIG_SERVICE',
  maplargeDebug = 'MAPLARGE_DEBUG',
  whatFix = 'WHATFIX',
  dataPackageWorkflow = "DATA_PACKAGE_WORKFLOW",
  dataOpportunityWorkflow = "DATA_OPPORTUNITY_WORKFLOW"
}

export enum EventsEnum {
  useLicenseRound = 'EVENT_USE_LICENSE_ROUND'
}

export const localFeatureFlags = {
  GIS_LAYER_CONFIG_SERVICE: 'on',
  MAPLARGE_DEBUG: 'on',
  WHATFIX: 'off',
  DATA_PACKAGE_WORKFLOW: 'off',
  DATA_OPPORTUNITY_WORKFLOW: 'on'
};

export interface FeatureFlagServiceConfig {
  production: boolean;
  appKey: string;
}

export type SplitFactory = (settings: SplitIO.IBrowserSettings) => SplitIO.ISDK;

export const SplitFactoryToken = new InjectionToken<SplitFactory>('SplitFactory');

export type JwtDecoder = (sauthToken: string) => { subid: string; };

export const JwtDecoderToken = new InjectionToken<JwtDecoder>('JwtDecoder');

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService implements OnDestroy {
  private splitClient: SplitIO.IClient;
  private treatments: SplitIO.TreatmentsWithConfig;
  private treatments$ = {};
  private configs$ = {};
  private user: ReturnType<JwtDecoder>;
  private trafficType = 'User';
  private treatmentSubscription: Subscription;

  constructor(
    @Inject(SplitFactoryToken)
    public readonly splitFactory: SplitFactory,
    @Inject(JwtDecoderToken)
    public readonly jwtDecoder: JwtDecoder
  ) {
    const featureArray = Object.values(FeaturesEnum);
    const featureEnumLength = featureArray.length;

    for (let i = 0; i < featureEnumLength; i++) {
      this.treatments$[featureArray[i]] = new BehaviorSubject<boolean>(null);
      this.configs$[featureArray[i]] = new BehaviorSubject<any>(null);
    }
  }

  public sauthToken: string;
  public config: FeatureFlagServiceConfig;
  public sdkInitialized: boolean;
  private sdkReady: boolean;

  ngOnDestroy() {
    this.treatmentSubscription?.unsubscribe();
    this.splitClient?.destroy();
  }

  public setSauthToken(sauthToken: string): void {
    this.sauthToken = sauthToken;
    this.initialize();
  }

  public setConfig(config: FeatureFlagServiceConfig): void {
    this.config = config;
    this.initialize();
  }

  public initialize(): void {
    if (!this.sauthToken) {
      return;
    }
    if (!this.config) {
      return;
    }

    if (this.sdkInitialized) {
      return;
    }

    this.sdkInitialized = true;

    this.user = this.jwtDecoder(this.sauthToken);
    try {
      this.initializeSDK();
    } catch(error) {
      this.setDefaultTreatments();
    }
  }

  public initializeSDK(): void {
    // Instantiate the SDK
    let factory: SplitIO.ISDK;

    if (this.config.production === true) {
      factory = this.splitFactory({
        core: {
          authorizationKey: this.config.appKey,
          key: this.user.subid,
          trafficType: this.trafficType
        },
        storage: {
          type: 'LOCALSTORAGE',
          prefix: 'GAIA'
        },
        scheduler: {
          featuresRefreshRate: 15
        }
      });
    } else {
      factory = this.splitFactory({
        core: {
          authorizationKey: 'localhost',
          key: 'customer-key'
        },
        features: localFeatureFlags
      });
    }

    this.splitClient = factory.client();

    const sdkEvents = merge(
      fromEvent(this.splitClient, this.splitClient.Event.SDK_READY),
      fromEvent(this.splitClient, this.splitClient.Event.SDK_UPDATE)
    );

    fromEvent(this.splitClient, this.splitClient.Event.SDK_READY_TIMED_OUT).subscribe(() => {
      if (!this.sdkReady){
        this.setDefaultTreatments();
      }
    });

    this.treatmentSubscription = sdkEvents.subscribe(() => {
      this.sdkReady = true;
      this.updateTreatments()
    });
  }

  public featureEnabled(feature: FeaturesEnum): Observable<boolean> {
    return this.treatments$[feature].asObservable().pipe(
      distinctUntilChanged(),
      filter(value => value !== null));
  }

  public configWithFeature(feature: FeaturesEnum): Observable<any> {
    return this.configs$[feature].asObservable().pipe(
      distinctUntilChanged(),
      filter(value => value !== null));
  }

  public featureEnabledSnapshot(feature: FeaturesEnum): boolean {
    const featureValue = get(this.treatments, feature);
    if (!featureValue) {
      return false;
    }
    return this.convertTreatment(featureValue.treatment);
  }

  public trackEvent(event: EventsEnum, value: number = null): boolean {
    return this.splitClient.track(event, value);
  }

  private setDefaultTreatments() {
    const featureArray = Object.values(FeaturesEnum);
    const featureEnumLength = featureArray.length;
    for (let i = 0; i < featureEnumLength; i++) {
      this.treatments$[featureArray[i]].next(this.convertTreatment(localFeatureFlags[featureArray[i]]));
    }
  }

  private updateTreatments(): void {
    const attributes: SplitIO.Attributes = {
      pathname: window.location.pathname,
      subid: this.user.subid
    };

    const tempTreatments = this.splitClient.getTreatmentsWithConfig(Object.values(FeaturesEnum), attributes);

    const featureArray = Object.values(FeaturesEnum);
    const featureEnumLength = featureArray.length;

    if (!this.treatments) {
      this.treatments = tempTreatments;
      for (let i = 0; i < featureEnumLength; i++) {
        this.treatments$[featureArray[i]].next(this.convertTreatment(this.treatments[featureArray[i]].treatment));
        this.configs$[featureArray[i]].next(this.convertConfig(this.treatments[featureArray[i]].config));
      }
    } else {
      featureArray.forEach((t) => {
        if (this.treatments[t] !== tempTreatments[t]) {
          this.treatments[t] = tempTreatments[t];
          this.treatments$[t].next(this.convertTreatment(this.treatments[t].treatment));
          this.configs$[t].next(this.convertConfig(this.treatments[t].config));
        }
      });
    }
  }

  private convertTreatment(treatment: string): boolean {
    return [
      'on',
      'onWithDifferentConfig1',
      'onWithDifferentConfig2',
      'onWithDifferentConfig3'
    ].includes(treatment);
  }

  private convertConfig(config: string): any {
    try {
      return JSON.parse(config);
    }
    catch {
      return null;
    }
  }
}
