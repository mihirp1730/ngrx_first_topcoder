import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

import { IOpportunitySubscriptionRequestsPayload } from './interfaces/opportunity-attendee.interface';
import {
  OpportunityAttendeeService,
  OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
  OPPORTUNITY_REQUEST_ATTENDEE_API_URL,
  APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE,
  OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL,
  OPPORTUNITY_SUBSCRIPTION_ATTENDEE_API_URL
} from './opportunity-attendee.service';

describe('OpportunityAttendeeService', () => {
  let service: OpportunityAttendeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
          useValue: 'http://opportunity-api'
        },
        {
          provide: APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE,
          useValue: 'http://opportunityGateway-api'
        },
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'app-key'
              }
            }
          }
        },
        {
          provide: OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL,
          useValue: 'http://opportunity-subscription-request'
        },
        {
          provide: OPPORTUNITY_REQUEST_ATTENDEE_API_URL,
          useValue: 'http://opportunity-subscription-requests'
        },
        {
          provide: OPPORTUNITY_SUBSCRIPTION_ATTENDEE_API_URL,
          useValue: 'http://opportunity-subscriptions'
        }
      ]
    });
    service = TestBed.inject(OpportunityAttendeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getListPublishedOpportunities', () => {
    it('should retrieve attendee opportunities', (done) => {
      const mockResponse = {};
      service.getListPublishedOpportunities().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://opportunity-api').flush(mockResponse);
    });
  });

  describe('getPublishedOpportunityById', () => {
    it('should retrieve a single opportunity', (done) => {
      const mockResponse = {};
      const opportunityId = 'op123';
      service.getPublishedOpportunityById(opportunityId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne(`http://opportunityGateway-api/${opportunityId}`).flush(mockResponse);
    });
  });

  describe('createRequestAccess', () => {
    it('should create subscription request', (done) => {
      const mockResponse = { opportunitySubscriptionRequestId: 'r-123' };
      const payload: IOpportunitySubscriptionRequestsPayload = {
        opportunityId: '123',
        comment: 'test',
        companyName: 'test',
        requesterId: 'test@slb.com',
        accessLevels: ['test']
      };
      service.createRequestAccess(payload).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://opportunity-subscription-request').flush(mockResponse);
    });
  });

  describe('getOpportunityRequests', () => {
    it('should get opportunity request', (done) => {
      const mockResponse = { subscriptionRequestId: 'r-123' };
      service.getOpportunityRequestsList().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://opportunity-subscription-requests').flush(mockResponse);
    });
  });

  describe('getOpportunitySubscriptions', () => {
    it('should get subscriptions for opportunity', (done) => {
      const mockResponse = { opportunityRequestId: 'r-123' };
      service.getOpportunitySubscriptions().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://opportunity-subscriptions').flush(mockResponse);
    });
  });

});
