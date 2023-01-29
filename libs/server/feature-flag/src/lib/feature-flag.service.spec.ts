import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagService, Features } from './feature-flag.service';
import { ServerFeatureFlagModule } from './server-feature-flag.module';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  const mockConfig = { splitioNodejsKey: 'localhost' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ServerFeatureFlagModule.forRoot(mockConfig)],
      providers: [
        {
          provide: FeatureFlagService,
          useFactory: () => {
            return new FeatureFlagService(mockConfig.splitioNodejsKey);
          }
        }
      ]
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('getTreatment', () => {
    it('should call getTreatment and return the value', async () => {
      const getTreatmentSpy = jest.spyOn(service, 'getTreatment').mockReturnValue(true);
      const result = service.getFeatureFlag(Features.showExperimentalLayers, 'test-subid', 'wgmc');

      expect(getTreatmentSpy).toHaveBeenCalledWith('test-subid', Features.showExperimentalLayers, 'wgmc');
      expect(result).toBeTruthy();
    });

    it('should return false in an error', () => {
      const getTreatmentSpy = jest.spyOn(service, 'getTreatment').mockImplementationOnce(() => { throw new Error('error') });
      const result = service.getFeatureFlag(Features.showExperimentalLayers, 'test-subid', 'wgmc');

      expect(getTreatmentSpy).toHaveBeenCalledWith('test-subid', Features.showExperimentalLayers, 'wgmc');
      expect(result).toBeFalsy();
    });

    it('should return false when showExperimentalLayers flag is off', async () => {
      const result = service.getTreatment('test-subid', Features.showExperimentalLayers, 'wgmc');
      expect(result).toBeFalsy();
    });

    it('should return false when showExperimentalLayers flag is off without passing dataPartitionId', async () => {
      const result = service.getTreatment('test-subid', Features.showExperimentalLayers);
      expect(result).toBeFalsy();
    });

    it('should return false when sdk is not ready', async () => {
      service.sdkReady = false;
      const result = service.getTreatment('test-subid', Features.showExperimentalLayers);
      expect(result).toBeFalsy();
    });
  });

  });
