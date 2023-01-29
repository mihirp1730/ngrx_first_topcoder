import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WindowRef } from '@apollo/app/ref';
import { SettingsService, SETTINGS_SERVICE_API_URL, TM_CONSUMER_DETAILS } from './settings.service';

const mockWindowRef = {
  nativeWindow: {
    location: {
      hostname: 'localhost'
    }
  }
};

describe('SettingsService', () => {
  let settingsService: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SettingsService,
        {
          provide: SETTINGS_SERVICE_API_URL,
          useValue: 'SETTINGS_SERVICE_API_URL'
        },
        {
          provide: TM_CONSUMER_DETAILS,
          useValue: "[{ 'consumerURL': 'localhost', 'trafficManagerCode': 'local-4200-https' }]"
        },
        {
          provide: WindowRef,
          useValue: mockWindowRef
        }
      ]
    }).compileComponents();
    settingsService = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(settingsService).toBeTruthy();
  });

  describe('getSettings', () => {
    it('should return the HTTP response', (done) => {
      settingsService.getSettings().subscribe((resp) => {
        expect(resp).toBeTruthy();
        done();
      });
      httpMock.expectOne('SETTINGS_SERVICE_API_URL/map').flush('test');
    });
  });

  it('should return empty object on request error', (done) => {
    settingsService.getSettings().subscribe(
      (data) => {
        expect(data).toEqual({});
        done();
      },
      (e) => {
        done.fail();
      }
    );
    httpMock.expectOne('SETTINGS_SERVICE_API_URL/map').flush(
      {},
      {
        status: 500,
        statusText: 'Error'
      }
    );
  });

  it('should return the HTTP response', (done) => {
    settingsService.getExclusiveMapConfig().subscribe((resp) => {
      expect(resp).toBeTruthy();
      done();
    });
    httpMock.expectOne('SETTINGS_SERVICE_API_URL/map-config').flush('test');
  });
  it('should return empty object on request error', (done) => {
    settingsService.getExclusiveMapConfig().subscribe(
      (data) => {
        expect(data).toEqual({});
        done();
      },
      (e) => {
        done.fail();
      }
    );
    httpMock.expectOne('SETTINGS_SERVICE_API_URL/map-config').flush(
      {},
      {
        status: 500,
        statusText: 'Error'
      }
    );
  });

  it('should return the HTTP response', (done) => {
    settingsService.getConsumerAppUrl('vendorid').subscribe((resp) => {
      expect(resp).toBeTruthy();
      done();
    });
    httpMock.expectOne('SETTINGS_SERVICE_API_URL/consumer-url').flush('test');
  });
  it('should return empty object on request error', (done) => {
    settingsService.getConsumerAppUrl('vendorid').subscribe(
      (data) => {
        expect(data).toEqual({});
        done();
      },
      (e) => {
        done.fail();
      }
    );
    httpMock.expectOne('SETTINGS_SERVICE_API_URL/consumer-url').flush(
      {},
      {
        status: 500,
        statusText: 'Error'
      }
    );
  });
  it('should return traffic manager code for current host', () => {
    const tmCode = settingsService.getTrafficManagerConfig();
    expect(tmCode).toBe('local-4200-https');
  });
});
