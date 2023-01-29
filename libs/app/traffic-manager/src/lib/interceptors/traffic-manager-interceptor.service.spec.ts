import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import {
  TRAFFIC_MANAGER_SERVICE,
  TRAFFIC_MANAGER_CONFIGURATION,
  ITrafficManagerService,
  ITrafficManagerConfiguration
} from '../interfaces';
import { TrafficManagerServiceModule } from '../app-traffic-manager.module';

describe('TrafficManagerInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TrafficManagerServiceModule.forRoot({
          provide: TRAFFIC_MANAGER_CONFIGURATION,
          useValue: {
            isEnabled: false
          }
        })
      ]
    });
  });

  it('should not traffic manager token if it is not enabled', inject(
    [HttpClient, HttpTestingController, TRAFFIC_MANAGER_CONFIGURATION],
    (http: HttpClient, httpMock: HttpTestingController, config: ITrafficManagerConfiguration) => {
      http.get('/data').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      httpMock.expectOne((req) => !req.headers.has('x-traffic-manager'));

      httpMock.verify();
    }
  ));

  it('should not traffic manager token if empty token', inject(
    [HttpClient, HttpTestingController, TRAFFIC_MANAGER_CONFIGURATION],
    (http: HttpClient, httpMock: HttpTestingController, config: ITrafficManagerConfiguration) => {
      config.isEnabled = true;

      http.get('/data').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      httpMock.expectOne((req) => !req.headers.has('x-traffic-manager'));

      httpMock.verify();
    }
  ));

  it('should add traffic manager token', inject(
    [HttpClient, HttpTestingController, TRAFFIC_MANAGER_CONFIGURATION, TRAFFIC_MANAGER_SERVICE],
    (http: HttpClient, httpMock: HttpTestingController, config: ITrafficManagerConfiguration, service: ITrafficManagerService) => {
      config.isEnabled = true;
      jest.spyOn(service, 'getToken').mockReturnValue('token!');

      http.get('/data').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      httpMock.expectOne((req) => req.headers.has('x-traffic-manager') && req.headers.get('x-traffic-manager') === 'token!');

      httpMock.verify();
    }
  ));
});
