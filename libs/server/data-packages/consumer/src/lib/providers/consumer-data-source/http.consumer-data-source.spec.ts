import { DataPackageSubscriptionStatus, DataRequests, DataSubscriptions } from '@apollo/api/data-packages/consumer';
import { ServerRequestContextService } from '@apollo/server/request-context';
import { HttpService } from '@nestjs/axios';
import { v4 as uuid } from 'uuid';

import { HttpConsumerDataSource } from './http.consumer-data-source';

class MockHttpClient {
  get = jest.fn();
}

class MockServerRequestContextService {
  requesterAccessToken = jest.fn();
}

function DataRequestFactory(dataRequests: Partial<DataRequests> = {}): DataRequests {
  return {
    subscriptionRequestId: 'abc123',
    requestStatus: 'Approved',
    requestedOn: 'requestedOn',
    ...dataRequests
  } as unknown as DataRequests;
}

describe('HttpConsumerDataSource', () => {
  let httpConsumerDataSource: HttpConsumerDataSource;
  let apiUrl: string;
  let apiPort: string;
  let httpService: MockHttpClient;
  let serverRequestContextService: MockServerRequestContextService;

  beforeEach(() => {
    apiUrl = uuid();
    apiPort = uuid();
    httpService = new MockHttpClient();
    httpConsumerDataSource = new HttpConsumerDataSource(
      apiUrl,
      apiPort,
      httpService as unknown as HttpService,
      serverRequestContextService as unknown as ServerRequestContextService
    );
  });

  describe('init', () => {
    it('should offer an init method', async () => {
      const result = await httpConsumerDataSource.init();
      expect(result).toBe(httpConsumerDataSource);
    });
  });

  describe('HttpConsumerDataSource.determineActive', () => {
    it('should return null', () => {
      const requests: DataRequests[] = [];
      const subscriptions: DataSubscriptions[] = [];
      const result = HttpConsumerDataSource.determineActive(requests, subscriptions);
      expect(result).toEqual(null);
    });
    it('should return a requested subscription', () => {
      const requests: DataRequests[] = [DataRequestFactory()];
      const subscriptions: DataSubscriptions[] = [
        {
          dataSubscriptionStatus: 'ACTIVE',
          subscriptionRequestId: 'abc123',
          startDate: 'startDate',
          endDate: 'endDate'
        } as unknown as DataSubscriptions
      ];
      const result = HttpConsumerDataSource.determineActive(requests, subscriptions);
      expect(result).toEqual({
        status: DataPackageSubscriptionStatus.Active,
        subscriptionStartTime: 'startDate',
        subscriptionEndTime: 'endDate',
        lastRequestTime: 'requestedOn'
      });
    });
    it('should return null  with mismatched subscription/request', () => {
      const requests: DataRequests[] = [DataRequestFactory()];
      const subscriptions: DataSubscriptions[] = [
        {
          dataSubscriptionStatus: 'ACTIVE',
          subscriptionRequestId: 'xyz890',
          startDate: 'startDate',
          endDate: 'endDate'
        } as unknown as DataSubscriptions
      ];
      const result = HttpConsumerDataSource.determineActive(requests, subscriptions);
      expect(result).toEqual(null);
    });
  });

  describe('HttpConsumerDataSource.determineApproved', () => {
    it('should return null', () => {
      const requests: DataRequests[] = [];
      const subscriptions: DataSubscriptions[] = [];
      const result = HttpConsumerDataSource.determineApproved(requests, subscriptions);
      expect(result).toEqual(null);
    });
    it('should return a requested subscription', () => {
      const requests: DataRequests[] = [DataRequestFactory()];
      const subscriptions: DataSubscriptions[] = [
        {
          dataSubscriptionStatus: 'APPROVED',
          subscriptionRequestId: 'abc123',
          startDate: '2022-10-10 10:10',
          endDate: '2023-10-10 10:10'
        } as unknown as DataSubscriptions,
        {
          dataSubscriptionStatus: 'APPROVED',
          subscriptionRequestId: 'abc123',
          startDate: '2020-10-10 10:10',
          endDate: '2023-10-10 10:10'
        } as unknown as DataSubscriptions
      ];
      const result = HttpConsumerDataSource.determineApproved(requests, subscriptions);
      expect(result).toEqual({
        status: DataPackageSubscriptionStatus.Approved,
        subscriptionStartTime: '2020-10-10 10:10',
        subscriptionEndTime: '2023-10-10 10:10',
        lastRequestTime: 'requestedOn'
      });
    });
    it('should return null  with mismatched subscription/request', () => {
      const requests: DataRequests[] = [DataRequestFactory()];
      const subscriptions: DataSubscriptions[] = [
        {
          dataSubscriptionStatus: 'ACTIVE',
          subscriptionRequestId: 'xyz890',
          startDate: '2022-10-10 10:10',
          endDate: '2023-10-10 10:10'
        } as unknown as DataSubscriptions
      ];
      const result = HttpConsumerDataSource.determineApproved(requests, subscriptions);
      expect(result).toEqual(null);
    });
  });

  describe('HttpConsumerDataSource.determinePending', () => {
    it('should return null', () => {
      const requests: DataRequests[] = [];
      const subscriptions: DataSubscriptions[] = [];
      const result = HttpConsumerDataSource.determinePending(requests, subscriptions);
      expect(result).toEqual(null);
    });
    it('should return a requested subscription', () => {
      const requests: DataRequests[] = [
        DataRequestFactory({
          requestStatus: 'Pending',
          requestedOn: '2022-10-10 10:10'
        }),
        DataRequestFactory({
          requestStatus: 'Pending',
          requestedOn: '2024-10-10 10:10'
        })
      ];
      const subscriptions: DataSubscriptions[] = [];
      const result = HttpConsumerDataSource.determinePending(requests, subscriptions);
      expect(result).toEqual({
        status: DataPackageSubscriptionStatus.Requested,
        subscriptionStartTime: '',
        subscriptionEndTime: '',
        lastRequestTime: '2024-10-10 10:10'
      });
    });
    it('should return null  with mismatched subscription/request', () => {
      const requests: DataRequests[] = [DataRequestFactory()];
      const subscriptions: DataSubscriptions[] = [];
      const result = HttpConsumerDataSource.determinePending(requests, subscriptions);
      expect(result).toEqual(null);
    });
  });

  describe('HttpConsumerDataSource.determineExpired', () => {
    it('should return null', () => {
      const requests: DataRequests[] = [];
      const subscriptions: DataSubscriptions[] = [];
      const result = HttpConsumerDataSource.determineExpired(requests, subscriptions);
      expect(result).toEqual(null);
    });
    it('should return a requested subscription', () => {
      const requests: DataRequests[] = [];
      const subscriptions: DataSubscriptions[] = [
        {
          dataSubscriptionStatus: 'EXPIRED',
          subscriptionRequestId: 'abc123',
          startDate: '2022-10-10 10:10',
          endDate: '2023-10-10 10:10'
        } as unknown as DataSubscriptions,
        {
          dataSubscriptionStatus: 'EXPIRED',
          subscriptionRequestId: 'abc123',
          startDate: '2020-10-10 10:10',
          endDate: '2024-10-10 10:10'
        } as unknown as DataSubscriptions
      ];
      const result = HttpConsumerDataSource.determineExpired(requests, subscriptions);
      expect(result).toEqual({
        status: DataPackageSubscriptionStatus.Expired,
        subscriptionStartTime: '2020-10-10 10:10',
        subscriptionEndTime: '2024-10-10 10:10',
        lastRequestTime: ''
      });
    });
  });
});
