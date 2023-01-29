import { EventsEnum, FeatureFlagService, FeaturesEnum, SplitFactory } from './feature-flag.service';
import { take } from 'rxjs/operators';
import EventEmitter = require('events');

class MockSplitFactory extends EventEmitter {
  Event = {
    SDK_READY: 'SDK_READY',
    SDK_UPDATE: 'SDK_UPDATE',
  }
  destroy = () => null;
  track = () => null;
  getTreatmentsWithConfig() {
    return {
      [FeaturesEnum.gisLayerConfigService]: {
        treatment: null
      },
      [FeaturesEnum.maplargeDebug]: {
        treatment: null
      },
      [FeaturesEnum.whatFix]: {
        treatment: null
      }
    };
  }
  client() {
    return this;
  }
}

describe('FeatureFlagService', () => {
  let featureFlagService: FeatureFlagService;
  let mockSplitFactory: MockSplitFactory;

  beforeEach(() => {
    mockSplitFactory = new MockSplitFactory();
    featureFlagService = new FeatureFlagService(
      () => mockSplitFactory as unknown as ReturnType<SplitFactory>,
      () => ({ subid: 'subid' })
    );
    featureFlagService.initialize();
    featureFlagService.setSauthToken('sauth');
    featureFlagService.setConfig({
      appKey: null,
      production: true
    });
  });

  it('should be created', () => {
    expect(featureFlagService).toBeTruthy();
  });

  describe('ngOnDestroy', () => {
    it('should handle being called with no subscriptions', () => {
      featureFlagService.ngOnDestroy();
      expect(featureFlagService).toBeTruthy();
    });
  });

  describe('initialize', () => {
    it('should handle multiple initializations', () => {
      featureFlagService.initialize();
      expect(featureFlagService).toBeTruthy();
    });
  });

  describe('featureEnabled', () => {
    it('should return a feature value stream', (done) => {
      featureFlagService.featureEnabled(FeaturesEnum.maplargeDebug)
        .pipe(take(1))
        .subscribe((value) => {
          expect(value).toBeDefined();
          done();
        });
      mockSplitFactory.emit(mockSplitFactory.Event.SDK_UPDATE);
    });
    it('should return a feature value stream w/new values', (done) => {
      featureFlagService.featureEnabled(FeaturesEnum.maplargeDebug)
        .pipe(take(2))
        .subscribe((value) => {
          expect(value).toBeDefined();
          if (value) {
            done();
          }
        });
      mockSplitFactory.emit(mockSplitFactory.Event.SDK_UPDATE);
      jest.spyOn(mockSplitFactory, 'getTreatmentsWithConfig').mockReturnValue({
        [FeaturesEnum.gisLayerConfigService]: {
          treatment: 'on'
        },
        [FeaturesEnum.maplargeDebug]: {
          treatment: 'on'
        }
      } as any);
      mockSplitFactory.emit(mockSplitFactory.Event.SDK_UPDATE);
    });
  });

  describe('configWithFeature', () => {
    it('should return a feature/config value stream', (done) => {
      jest.spyOn(mockSplitFactory, 'getTreatmentsWithConfig').mockReturnValue({
        [FeaturesEnum.gisLayerConfigService]: {
          treatment: 'on'
        },
        [FeaturesEnum.maplargeDebug]: {
          treatment: 'on',
          config: JSON.stringify({ abc: 123 })
        }
      } as any);
      mockSplitFactory.emit(mockSplitFactory.Event.SDK_UPDATE);
      featureFlagService.configWithFeature(FeaturesEnum.maplargeDebug)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual({ abc: 123 });
          done();
        });
    });
  });

  describe('featureEnabledSnapshot', () => {
    it('should handle standard input', () => {
      jest.spyOn(mockSplitFactory, 'getTreatmentsWithConfig').mockReturnValue({
        [FeaturesEnum.maplargeDebug]: {
          treatment: 'on'
        }
      } as any);
      mockSplitFactory.emit(mockSplitFactory.Event.SDK_UPDATE);
      const result = featureFlagService.featureEnabledSnapshot(FeaturesEnum.maplargeDebug);
      expect(result).toBeTruthy();
    });
    it('should handle bad input', () => {
      const result = featureFlagService.featureEnabledSnapshot(null);
      expect(result).toBeFalsy();
    });
  });

  describe('trackEvent', () => {
    it('should call the SplitIO client method', () => {
      const spy = jest.spyOn(mockSplitFactory, 'track').mockImplementation();
      featureFlagService.trackEvent(EventsEnum.useLicenseRound, 1);
      expect(spy).toHaveBeenCalledWith(EventsEnum.useLicenseRound, 1);
    });
    it('should handle optional parameters', () => {
      const spy = jest.spyOn(mockSplitFactory, 'track').mockImplementation();
      featureFlagService.trackEvent(EventsEnum.useLicenseRound);
      expect(spy).toHaveBeenCalledWith(EventsEnum.useLicenseRound, null);
    });
  });

});
