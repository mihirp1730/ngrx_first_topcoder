import { Injectable } from '@angular/core';
import { AuthUser, IMapConfiguration, IMapSettings } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { ICategory, MetadataService } from '@apollo/app/metadata';
import { SettingsService } from '@apollo/app/settings';
import { zip } from 'rxjs';
import { take } from 'rxjs/operators';

type LoadCallback = (metadata: ICategory[], config: IMapSettings, user: AuthUser, mlDebug: boolean, exlusiveMapConfig: any) => void;

@Injectable({
  providedIn: 'root'
})
export class ConfigurationLoaderService {
  private mapLargeConfiguration: IMapConfiguration;

  get MapLargeConfiguration(): IMapConfiguration {
    return this.mapLargeConfiguration;
  }
  set MapLargeConfiguration(val: IMapConfiguration) {
    this.mapLargeConfiguration = val;
  }

  constructor(
    private metadataService: MetadataService,
    private settingsService: SettingsService,
    private authCodeFlowService: AuthCodeFlowService,
    private featureFlagService: FeatureFlagService
  ) {}

  load(onLoad: LoadCallback): void {
    zip(
      this.metadataService.metadata$,
      this.settingsService.getSettings(),
      this.authCodeFlowService.getUser(),
      this.featureFlagService.featureEnabled(FeaturesEnum.maplargeDebug).pipe(take(1)),
      this.settingsService.getExclusiveMapConfig()
    ).subscribe(([metadata, config, user, mlDebug, exclusiveMapConfig]) => onLoad(metadata, config, user, mlDebug, exclusiveMapConfig));
  }
}
