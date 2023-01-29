import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PERFORMANCE_INDICATOR, PerformanceIndicatorService } from './performance-indicator.service';
import { SESSION_SERVICE_API_URL } from '@apollo/app/engine';

describe('PerformanceIndicatorService', () => {
  const url = 'test/LogAtlasClientPerformance';
  let httpMock: HttpTestingController;
  let service: PerformanceIndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PerformanceIndicatorService,
        {
          provide: SESSION_SERVICE_API_URL,
          useValue: 'test'
        }
      ]
    }).compileComponents();
  });
  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(PerformanceIndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start timing', () => {
    service.startTiming(PERFORMANCE_INDICATOR.apolloMapSearchTime);
    expect(service.performanceTimings[PERFORMANCE_INDICATOR.apolloMapSearchTime].startTime).not.toBe(0);
  });

  it('should end timing', () => {
    service.endTiming(PERFORMANCE_INDICATOR.apolloMapSearchTime);
    expect(service.performanceTimings[PERFORMANCE_INDICATOR.apolloMapSearchTime].endTime).not.toBe(0);
  });

  it('should clean record', () => {
    service.startTiming(PERFORMANCE_INDICATOR.apolloMapSearchTime);
    service.endTiming(PERFORMANCE_INDICATOR.apolloMapSearchTime);
    service.cleanRecord(PERFORMANCE_INDICATOR.apolloMapSearchTime);
    expect(service.performanceTimings[PERFORMANCE_INDICATOR.apolloMapSearchTime].startTime).toBe(0);
    expect(service.performanceTimings[PERFORMANCE_INDICATOR.apolloMapSearchTime].endTime).toBe(0);
  });

  it('should set subid', () => {
    service.setSauthToken(
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJhZG1pbiI6dHJ1ZSwianRpIjoiMDZhYTRkYmEtNDgzYy00NzBiLWEyMjctNDA3NzRiZTE0ZjIyIiwiaWF0IjoxNTY1NTc4MzE4LCJleHAiOjE1NjU1ODE5Mzh9.03uCahUc72wxBCo_cVokll3cIQN590J9ouNVaC3GP7Y'
    );
    expect(service.subid).toBe('1234567890');
  });

  it('should set data partition', () => {
    service.setDataPartition('testDataPartition');
    expect(service.dataPartition).toBe('testDataPartition');
  });

  describe('setBandwidth', () => {
    it('should accept provided bandwidth', async () => {
      await service.setBandwidth(123);
      expect(service).toBeTruthy();
      expect(await service.getBandwidth()).toBe(123);
    });
    it('should accept null input', async () => {
      await service.setBandwidth(null);
      expect(service).toBeTruthy();
      expect(await service.getBandwidth()).toBe(null);
    });
    it('should post if there are previously made measurements', () => {
      service.setBandwidth(null);
      service.startTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
      service.endTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
      httpMock.expectNone(url);
      service.setBandwidth(123);
      httpMock.expectOne(url);
    });
  });

  describe('reportPerformance', () => {
    it('should post', () => {
      service.setBandwidth(123);
      service.startTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
      service.endTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
      httpMock.expectOne(url);
    });
    it('should not post if the bandwidth is empty', () => {
      service.setBandwidth(null);
      service.startTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
      service.endTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
      httpMock.expectNone(url);
    });
  });
});
