import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as buildUrl from 'build-url';

import * as subscriptionInterfaces from './interfaces/consumer-subscription.interface';
import * as requestInterfaces from './interfaces/consumer-subscription-request.interface';

export const CONSUMER_SUBSCRIPTION_SERVICE_API_URL = new InjectionToken<string>('ConsumerSubscriptionServiceApiUrl');
export const APP_BASE_URL_CONSUMER = new InjectionToken<any>('appBaseUrl');

interface GetConsumerSubscriptionsQueryParams {
  limit: number;
  after: number;
  status: string;
  dataPackageId?: string;
  onlyActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConsumerSubscriptionService {
  constructor(
    private httpClient: HttpClient,
    @Inject(CONSUMER_SUBSCRIPTION_SERVICE_API_URL) private readonly dataSubscriptionApiUrl: string,
    @Inject(APP_BASE_URL_CONSUMER) private readonly appBaseUrl: string
  ) {}

  public getConsumerSubscriptions(payload: GetConsumerSubscriptionsQueryParams): Observable<Array<subscriptionInterfaces.ISubscription>> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscriptions`;
    const urlWithParams = buildUrl(url, {
      queryParams: {
        dataPackageId: payload.dataPackageId ?? '',
        limit: payload.limit.toString(),
        after: payload.after.toString(),
        status: payload.status
      }
    });

    // Sometimes we don't want to include 'APPROVED', when looking
    // for 'ACTIVE' status subscriptions... use `onlyActive` then.
    if (payload.status === 'ACTIVE' && !payload.onlyActive) {
      const urlWithParamsApproved = buildUrl(url, {
        queryParams: {
          dataPackageId: payload.dataPackageId ?? '',
          limit: payload.limit.toString(),
          after: payload.after.toString(),
          status: 'APPROVED'
        }
      });

      return forkJoin([
        this.httpClient.get<subscriptionInterfaces.IGetSubscriptionsResponse>(urlWithParams),
        this.httpClient.get<subscriptionInterfaces.IGetSubscriptionsResponse>(urlWithParamsApproved)
      ]).pipe(map(([activeSubsResponse, approvedSubsResponse]) => [...activeSubsResponse.items, ...approvedSubsResponse.items]));
    }

    return this.httpClient.get<subscriptionInterfaces.IGetSubscriptionsResponse>(urlWithParams).pipe(map((response) => response.items));
  }

  public getConsumerSubscriptionRequests(payload: { status: string }): Observable<Array<requestInterfaces.ISubscriptionRequest>> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscription-requests`;
    const urlWithParams = buildUrl(url, {
      queryParams: {
        status: payload.status
      }
    });

    return this.httpClient.get<requestInterfaces.ISubscriptionRequestsResponse>(urlWithParams).pipe(map((response) => response.items));
  }

  public getConsumerSubscription(subscriptionId: string): Observable<subscriptionInterfaces.ISubscription> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscriptions/${subscriptionId}`;
    return this.httpClient.get<subscriptionInterfaces.ISubscription>(url);
  }

  public getConsumerSubscriptionDataItems(subscriptionId: string): Observable<subscriptionInterfaces.IDataItems> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscriptions/${subscriptionId}/data-items`;
    return this.httpClient.get<subscriptionInterfaces.IDataItems>(url);
  }

  getOpportunityConsumerUrl(opportunityId: string): string {
    return `${this.appBaseUrl}/opportunity/${opportunityId}`;
  }
}
