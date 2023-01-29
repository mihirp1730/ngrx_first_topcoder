import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as buildUrl from 'build-url';

import * as interfaces from './interfaces/data-subscription.interface';

export const DATA_SUBSCRIPTION_SERVICE_API_URL = new InjectionToken<string>('DataSubscriptionServiceApiUrl');

@Injectable({
  providedIn: 'root'
})
export class DataSubscriptionService {
  constructor(
    private httpClient: HttpClient,
    @Inject(DATA_SUBSCRIPTION_SERVICE_API_URL) private readonly dataSubscriptionApiUrl: string,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel
  ) {}

  public getRequests(): Observable<Array<interfaces.IRequest>> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscription-requests`;
    const options = this.getRequestOptions();

    return this.httpClient.get<interfaces.IGetRequestsResponse>(url, options).pipe(map((response) => response.items));
  }

  public createSubscriptionRequests(dataPackageId: string, comment: string, companyName: string): Observable<interfaces.ICreateSubscriptionResponse> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscription-requests`;
    const postBody: interfaces.ISubscriptionRequestsBody = {
      dataPackageId: dataPackageId,
      comment: comment,
      companyName: companyName
    };
    const options = this.getRequestOptions();
    delete options.headers.billingAccountId;
    return this.httpClient.post<interfaces.ICreateSubscriptionResponse>(url, postBody, options);
  }

  public createSubscription(postBody: interfaces.ICreateSubscriptionReqBody): Observable<interfaces.ICreateSubscriptionResponse> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscriptions`;
    const options = this.getRequestOptions();
    return this.httpClient.post<interfaces.ICreateSubscriptionResponse>(url, postBody, options);
  }

  // Internal methods

  private getRequestOptions() {
    const headers = {
      'Content-Type': 'application/json',
      billingAccountId: this.userContext.crmAccountId
    };

    return { headers };
  }

  public getManageSubscription(payload: { limit: number; after: number; before: number }): Observable<Array<interfaces.IManageSubscription>> {
    const url = `${this.dataSubscriptionApiUrl}/data-subscriptions`;
    const urlWithParams = buildUrl(url);
    const options = this.getRequestOptions();

    return this.httpClient.get<interfaces.IGetManageSusbcriptionResponse>(urlWithParams, options).pipe(map((response) => response.items));
  }
}
