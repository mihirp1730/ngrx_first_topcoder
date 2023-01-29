import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { IOpportunityHostRequestConfig } from '../interfaces/interface';
import { HttpBaseDataSource } from './http.base.data-source';

class MockHttpClient {
  get = jest.fn();
}

describe('HttpBaseDataSource', () => {
  let httpBaseDataSource: HttpBaseDataSource;
  let httpService: MockHttpClient;
  const config: IOpportunityHostRequestConfig = { hostBaseUrl: 'url' };

  beforeEach(() => {
    httpService = new MockHttpClient();
    httpBaseDataSource = new HttpBaseDataSource(config as IOpportunityHostRequestConfig, httpService as unknown as HttpService);
  });

  describe('init', () => {
    it('should offer an init method', async () => {
      const result = await httpBaseDataSource.init();
      expect(result).toBe(httpBaseDataSource);
    });
  });

  describe('requestDetails', () => {
    it('should return opportunity request details', (done) => {
      const vendorid = 'test';
      const requests = {
        requestData: [
          {
            subscriptionRequestId: uuid(),
            accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION']
          }
        ],
        correlationId: 'abc'
      };
      const subscriptions = [
        {
          subscriptionRequestId: uuid(),
          accessDetails: [
            {
              accessLevel: 'VDR',
              startDate: '28/06/2023',
              endDate: '28/12/2023',
              status: 'Approved'
            },
            {
              accessLevel: 'CONFIDENTIAL_INFORMATION',
              startDate: '28/06/2023',
              endDate: '28/12/2023',
              status: 'Approved'
            }
          ]
        }
      ];
      jest.spyOn(httpBaseDataSource, 'getOpportunityRequests').mockReturnValue(Promise.resolve(requests as any));
      jest.spyOn(httpBaseDataSource, 'getOpportunitySubscription').mockReturnValue(Promise.resolve(subscriptions as any));
      httpBaseDataSource.getOpportunityRequestDetails('token', vendorid, { host: 'localhost' } as any).then((res) => {
        expect(res.response.length).toEqual(1);
        done();
      });
    });
  });

  describe('getOpportunityRequests', () => {
    it('should get opportunity requests', async () => {
      const subscriptionRequestId = uuid();
      const vendorid = 'test';
      const requests = { data: { items: [{ subscriptionRequestId }] }, headers: { 'correlation-id': 'det89rguh' } };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(requests as any));
      const res = await httpBaseDataSource.getOpportunityRequests('token', vendorid, { host: 'localhost' } as any);
      expect(res.requestData).toBe(requests.data.items);
    });
  });

  describe('getOpportunitySubscriptions', () => {
    it('should get opportunity subscriptions', async () => {
      const opportunitySubscriptionId = uuid();
      const vendorid = 'test';
      const requests = { data: { items: [{ opportunitySubscriptionId }] } };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(requests as any));
      const res = await httpBaseDataSource.getOpportunitySubscription('token', vendorid, { host: 'localhost' } as any);
      expect(res).toBe(requests.data.items);
    });
  });

  describe('filterSubscription', () => {
    it('should generate response', () => {
      const requests = [
        {
          subscriptionRequestId: 'test',
          accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION'],
          opportunityId: 'OP-VD7-lypx2py1tu1d-223302828532',
          requestedBy: 'test@slb.com'
        }
      ];
      const subscriptions = [
        {
          subscriptionRequestId: 'test',
          opportunityId: 'OP-VD7-lypx2py1tu1d-223302828532',
          attendeeId: 'test@slb.com',
          accessDetails: [
            {
              accessLevel: 'VDR',
              startDate: '28/06/2023',
              endDate: '28/12/2023',
              status: 'APPROVED'
            },
            {
              accessLevel: 'CONFIDENTIAL_INFORMATION',
              startDate: '28/06/2023',
              endDate: '28/12/2023',
              status: 'APPROVED'
            }
          ]
        }
      ];
      const result = httpBaseDataSource.generateResponse(requests as any, subscriptions as any);
      expect(result.length).toBe(1);
    });
  });

  describe('generateResponse', () => {
    it('should generate response', () => {
      const accessesDeatils = [];
      const requests = [
        {
          subscriptionRequestId: 'test',
          opportunityId: 'OP-VD7-lypx2py1tu1d-223302828532',
          requestedBy: 'test@slb.com',
          accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION']
        }
      ];
      const subscriptions = [
        {
          subscriptionRequestId: 'test',
          opportunityId: 'OP-VD7-lypx2py1tu1d-223302828532',
          attendeeId: 'test@slb.com',
          accessDetails: [
            {
              accessLevel: 'VDR',
              startDate: '28/06/2023',
              endDate: '28/12/2023',
              status: 'APPROVED'
            },
            {
              accessLevel: 'CONFIDENTIAL_INFORMATION',
              startDate: '28/06/2023',
              endDate: '28/12/2023',
              status: 'APPROVED'
            }
          ]
        }
      ];
      const result = httpBaseDataSource.generateResponse(requests as any, subscriptions as any);
      expect(result);
    });
  });
});
