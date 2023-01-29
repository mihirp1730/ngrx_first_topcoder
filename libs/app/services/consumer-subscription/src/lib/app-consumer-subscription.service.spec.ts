import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_BASE_URL_CONSUMER, ConsumerSubscriptionService, CONSUMER_SUBSCRIPTION_SERVICE_API_URL } from './app-consumer-subscription.service';

describe('ConsumerSubscriptionService', () => {
  let service: ConsumerSubscriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: CONSUMER_SUBSCRIPTION_SERVICE_API_URL,
          useValue: 'http://data-subscription-api'
        },
        {
          provide: APP_BASE_URL_CONSUMER,
          useValue: 'http://opportunity-base-path'
        }
      ]
    });
    service = TestBed.inject(ConsumerSubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call consumer active subscriptions endpoint', (done) => {
    const mockActiveResponse = { items: ['item1'] };
    const mockApprovedResponse = { items: ['item2'] };
    service.getConsumerSubscriptions({ limit: 0, after: 0, status: 'ACTIVE' }).subscribe(response => {
      expect(response).toEqual([ 'item1', 'item2']);
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscriptions?dataPackageId=&limit=0&after=0&status=ACTIVE').flush(mockActiveResponse);
    httpMock.expectOne('http://data-subscription-api/data-subscriptions?dataPackageId=&limit=0&after=0&status=APPROVED').flush(mockApprovedResponse);
  });

  it('should call consumer expired subscriptions endpoint', (done) => {
    const mockResponse = { items: [] };
    service.getConsumerSubscriptions({ limit: 0, after: 0, status: 'EXPIRED' }).subscribe(response => {
      expect(response).toEqual([]);
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscriptions?dataPackageId=&limit=0&after=0&status=EXPIRED').flush(mockResponse);
  });

  it('should call consumer subscription requests endpoint', (done) => {
    const mockResponse = { items: [] };
    service.getConsumerSubscriptionRequests({ status: '' }).subscribe(response => {
      expect(response).toEqual([]);
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscription-requests?status=').flush(mockResponse);
  });

  it('should call consumer subscription by id endpoint', (done) => {
    const subsId = 'sub_id';
    const mockRes = { dataSubscriptionId: subsId };
    service.getConsumerSubscription(subsId).subscribe(respone => {
      expect(respone).toEqual(mockRes);
      done();
    });

    httpMock.expectOne(`http://data-subscription-api/data-subscriptions/${subsId}`).flush(mockRes);
  });

  describe('getOpportunityConsumerUrl', () => {
    it('should call getOpportunityConsumerUrl', () => {
      const id = 'opp-id';
      const url = service.getOpportunityConsumerUrl(id);
      expect(url).toBe('http://opportunity-base-path/opportunity/opp-id');
    });
  });
});
