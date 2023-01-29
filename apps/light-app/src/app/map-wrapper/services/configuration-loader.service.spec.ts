import { TestBed } from '@angular/core/testing';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService } from '@apollo/app/feature-flag';
import { MetadataService } from '@apollo/app/metadata';
import { SettingsService } from '@apollo/app/settings';
import { of } from 'rxjs';

import { mockAuthCodeFlowService, mockFeatureFlagService, mockMetadataService, mockSettingsService } from '../../shared/services.mock';
import { ConfigurationLoaderService } from './configuration-loader.service';

describe('ConfigurationLoaderService', () => {
  let service: ConfigurationLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        {
          provide: SettingsService,
          useValue: mockSettingsService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(ConfigurationLoaderService).toBeTruthy();
  });

  it('should call callback on load', () => {
    const metadata = ['metadata'];
    mockMetadataService.metadata$ = of(metadata);

    const settingsData = { gisCanvas: null, zoomToRadius: null };
    mockSettingsService.getSettings.mockReturnValue(of(settingsData));

    const mapLargeConfiguration = { consumerURL: 'localhost', mapType: 'Exclusive' };
    mockSettingsService.getExclusiveMapConfig.mockReturnValue(of(mapLargeConfiguration));

    const userData = { token: 'test' } as unknown as AuthUser;
    mockAuthCodeFlowService.getUser.mockReturnValue(of(userData));

    const featureFlagData = true;
    mockFeatureFlagService.featureEnabled.mockReturnValue(of(featureFlagData));

    const spy = jest.fn();

    service = TestBed.inject(ConfigurationLoaderService);
    service.load(spy);

    expect(spy).toBeCalledWith(metadata, settingsData, userData, featureFlagData, mapLargeConfiguration);
  });
});
