import {
  DataPackageSubscription,
  DataPackageSubscriptionStatus,
  DataRequests,
  DataSubscriptions
} from '@apollo/api/data-packages/consumer';
import { GaiaAdviseClass } from '@apollo/server/aspect-logger';
import { ServerRequestContextService } from '@apollo/server/request-context';
import { GaiaTraceClass } from '@apollo/tracer';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';

import { BaseConsumerDataSource } from './base.consumer-data-source';

@GaiaAdviseClass()
@GaiaTraceClass
export class HttpConsumerDataSource extends BaseConsumerDataSource {
  constructor(
    public readonly apiUrl: string,
    public readonly apiPort: string,
    public readonly httpService: HttpService,
    public readonly serverRequestContextService: ServerRequestContextService
  ) {
    super();
  }

  // 1. `requests` and `subscriptions` will be of a single data package id
  static determineActive(requests: DataRequests[], subscriptions: DataSubscriptions[]): DataPackageSubscription | null {
    const subscriptionsActive = subscriptions.filter((obj) => obj.dataSubscriptionStatus === 'ACTIVE');
    const requestsApproved = requests.filter((obj) => obj.requestStatus === 'Approved');

    if (subscriptionsActive.length === 0) {
      //no active subscriptions
      return null;
    }

    for (const req of requestsApproved) {
      const subscriptionRequestId = req.subscriptionRequestId;
      const requestedSubscription = subscriptionsActive.find((obj) => obj.subscriptionRequestId === subscriptionRequestId);

      if (requestedSubscription) {
        return {
          status: DataPackageSubscriptionStatus.Active,
          subscriptionStartTime: requestedSubscription.startDate,
          subscriptionEndTime: requestedSubscription.endDate,
          lastRequestTime: req.requestedOn
        };
      }
    }

    return null;
  }

  // 1. `requests` and `subscriptions` will be of a single data package id
  // 2. and there are NO active subscriptions
  static determineApproved(requests: DataRequests[], subscriptions: DataSubscriptions[]): DataPackageSubscription | null {
    const subscriptionsApproved = subscriptions
      .sort((objA, objB) => new Date(objA.startDate).getTime() - new Date(objB.startDate).getTime())
      .find((obj) => obj.dataSubscriptionStatus === 'APPROVED');

    if (subscriptionsApproved) {
      const subscriptionRequestId = subscriptionsApproved.subscriptionRequestId;
      const requestApprovedByRequestId = requests.find((obj) => obj.subscriptionRequestId === subscriptionRequestId);

      if (requestApprovedByRequestId) {
        return {
          status: DataPackageSubscriptionStatus.Approved,
          subscriptionStartTime: subscriptionsApproved.startDate,
          subscriptionEndTime: subscriptionsApproved.endDate,
          lastRequestTime: requestApprovedByRequestId.requestedOn
        };
      }
    }

    return null;
  }

  // 1. `requests` and `subscriptions` will be of a single data package id
  // 2. and there are NO active subscriptions
  // 3. and there are NO approved subscriptions
  static determinePending(requests: DataRequests[], subscriptions: DataSubscriptions[]): DataPackageSubscription | null {
    const requestsPending = requests
      .sort((objA, objB) => new Date(objB.requestedOn).getTime() - new Date(objA.requestedOn).getTime())
      .find((obj) => obj.requestStatus === 'Pending');

    if (requestsPending) {
      return {
        status: DataPackageSubscriptionStatus.Requested,
        subscriptionStartTime: '',
        subscriptionEndTime: '',
        lastRequestTime: requestsPending.requestedOn
      };
    }

    return null;
  }

  // 1. `requests` and `subscriptions` will be of a single data package id
  // 2. and there are NO active subscriptions
  // 3. and there are NO approved subscriptions
  // 4. and there are NO pending subscriptions
  static determineExpired(requests: DataRequests[], subscriptions: DataSubscriptions[]): DataPackageSubscription | null {
    const subscriptionsExpired = subscriptions
      .sort((objA, objB) => new Date(objB.endDate).getTime() - new Date(objA.endDate).getTime())
      .find((obj) => obj.dataSubscriptionStatus === 'EXPIRED');

    if (subscriptionsExpired) {
      //subscription has expired and will not show up in requests array
      return {
        status: DataPackageSubscriptionStatus.Expired,
        subscriptionStartTime: subscriptionsExpired.startDate,
        subscriptionEndTime: subscriptionsExpired.endDate,
        lastRequestTime: ''
      };
    }

    return null;
  }

  public async init(): Promise<BaseConsumerDataSource> {
    return this;
  }

  /* istanbul ignore next */
  public async queryDataPackageSubscription(dataPackageId: string): Promise<DataPackageSubscription> {
    const token = this.serverRequestContextService.requesterAccessToken();
    const params = { dataPackageId };
    const headers = { authorization: `Bearer ${token}` };
    const options = { headers, params };
    const apiUrl = `${this.apiUrl}/consumer`;
    return Promise.all([
      this.httpService.get<{ items: DataSubscriptions[] }>(`${apiUrl}/data-subscriptions`, options).toPromise(),
      this.httpService.get<{ items: DataRequests[] }>(`${apiUrl}/data-subscription-requests`, options).toPromise()
    ])
      .then(([dataSubscriptions, dataSubscriptionsRequests]) => {
        //Filter out all REJECTED requests
        const dataSubscriptionsRequestsNotRejected = dataSubscriptionsRequests.data.items.filter((obj) => obj.requestStatus !== 'Rejected');

        const dataSubscriptionsList = dataSubscriptions.data.items;

        if (dataSubscriptionsRequestsNotRejected.length > 0) {
          const activeResponse = HttpConsumerDataSource.determineActive(dataSubscriptionsRequestsNotRejected, dataSubscriptionsList);
          if (activeResponse !== null) {
            return activeResponse;
          }

          const approvedResponse = HttpConsumerDataSource.determineApproved(dataSubscriptionsRequestsNotRejected, dataSubscriptionsList);
          if (approvedResponse !== null) {
            return approvedResponse;
          }

          const pendingResponse = HttpConsumerDataSource.determinePending(dataSubscriptionsRequestsNotRejected, dataSubscriptionsList);
          if (pendingResponse !== null) {
            return pendingResponse;
          }

          const expiredResponse = HttpConsumerDataSource.determineExpired(dataSubscriptionsRequestsNotRejected, dataSubscriptionsList);
          if (expiredResponse !== null) {
            return expiredResponse;
          }
        }

        return {
          status: DataPackageSubscriptionStatus.Void,
          subscriptionStartTime: '',
          subscriptionEndTime: '',
          lastRequestTime: ''
        };
      })
      .catch((err) => {
        throw new HttpException(err, HttpStatus.BAD_GATEWAY);
      });
  }
}
