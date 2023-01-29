import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { of } from 'rxjs';

import { APP_CCM_SERVICE_HOST, AT_APP_Code, UserSubscriptionService } from './app-user-subscription.service';

describe('UserSubscriptionService', () => {
  let service: UserSubscriptionService;
  let secureEnvironmentService: SecureEnvironmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: APP_CCM_SERVICE_HOST,
          useValue: 'http://subscription-api'
        },
        {
          provide: AT_APP_Code,
          useValue: 'assettransactionportal'
        },
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'app-key'
              },
              env: {},
              load: () => Promise.resolve()
            }
          }
        }
      ]
    });
    service = TestBed.inject(UserSubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
    secureEnvironmentService = TestBed.inject(SecureEnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserSubscription', () => {
    it('should invoke getUserSubscription method', (done) => {
      const mockResponse = {
        hasAcceptedTerms: true,
        userSubscriptions: []
      };
      const httpSpy = jest.spyOn((service as any).httpClient, 'get').mockReturnValue(of(mockResponse));
      const prepareHeadersSpy = jest.spyOn(service as any, 'prepareHeaders');
      const options = {
        headers: {
          appKey: secureEnvironmentService.secureEnvironment.app.key,
          'Content-Type': 'application/json'
        }
      };
      service.getUserSubscription();
      expect(prepareHeadersSpy).toBeCalled();
      expect(httpSpy).toBeCalledWith(
        'http://subscription-api/userSubscription/v2/userSubscriptions?appCode=assettransactionportal',
        options
      );
      done();
    });
  });
});
