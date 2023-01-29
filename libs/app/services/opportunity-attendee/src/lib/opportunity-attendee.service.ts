import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { WindowRef } from '@apollo/app/ref';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { Observable } from 'rxjs';

import * as interfaces from './interfaces/opportunity-attendee.interface';

export const OPPORTUNITY_ATTENDEE_SERVICE_API_URL = new InjectionToken<string>('OpportunityAttendeeServiceApiUrl');
export const OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL = new InjectionToken<string>('opportunitySubscriptionsRequestUrl');
export const APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE = new InjectionToken<string>('OpportunityGatewayAttendeeServiceApiUrl');
export const OPPORTUNITY_REQUEST_ATTENDEE_API_URL = new InjectionToken<string>('opportunityRequestAttendeeApiUrl');
export const OPPORTUNITY_SUBSCRIPTION_ATTENDEE_API_URL = new InjectionToken<string>('opportunitySubscriptionAttendeeApiUrl');
export const ATTENDEE_FILE_DOWNLOAD_SERVICE = new InjectionToken<string>('ContentServiceURL');
@Injectable({
  providedIn: 'root'
})
export class OpportunityAttendeeService {
  constructor(
    private httpClient: HttpClient,
    private readonly environment: SecureEnvironmentService,
    @Inject(OPPORTUNITY_ATTENDEE_SERVICE_API_URL) private readonly opportunityAttendeeServiceApiUrl: string,
    @Inject(OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL) private readonly opportunitySubscriptionRequestApiUrl: string,
    @Inject(APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE) private readonly OpportunityGatewayAttendeeServiceApiUrl: string,
    @Inject(OPPORTUNITY_REQUEST_ATTENDEE_API_URL) private readonly opportunityRequestAttendeeApiUrl: string,
    @Inject(OPPORTUNITY_SUBSCRIPTION_ATTENDEE_API_URL) private readonly opportunitySubscriptionAttendeeApiUrl: string,
    private readonly windowRef: WindowRef
  ) {}

  private getRequestOptions() {
    const headers = {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json'
    };
    return { headers };
  }

  public getListPublishedOpportunities(): Observable<interfaces.IAttendeeOpportunitiesResponse> {
    const url = `${this.opportunityAttendeeServiceApiUrl}`;
    const options = this.getRequestOptions();
    return this.httpClient.get<interfaces.IAttendeeOpportunitiesResponse>(url, options);
  }

  public getPublishedOpportunityById(opportunityId: string): Observable<interfaces.IOpportunitiesDetails> {
    const url = `${this.OpportunityGatewayAttendeeServiceApiUrl}/${opportunityId}`;
    const options = this.getRequestOptions();
    return this.httpClient.get<interfaces.IOpportunitiesDetails>(url, options);
  }

  public createRequestAccess(
    payload: interfaces.IOpportunitySubscriptionRequestsPayload
  ): Observable<interfaces.IOpportunitySubscriptionRequestsResponse> {
    const url = `${this.opportunitySubscriptionRequestApiUrl}`;
    const options = this.getRequestOptions();
    return this.httpClient.post<interfaces.IOpportunitySubscriptionRequestsResponse>(url, payload, options);
  }

  public getOpportunityRequestsList(): Observable<interfaces.IOpportunityRequestsResponse> {
    const url = `${this.opportunityRequestAttendeeApiUrl}`;
    const options = this.getRequestOptions();
    return this.httpClient.get<interfaces.IOpportunityRequestsResponse>(url, options);
  }

  public getOpportunitySubscriptions(): Observable<interfaces.IOpportunitySubscriptionsResponse> {
    const url = `${this.opportunitySubscriptionAttendeeApiUrl}`;
    const options = this.getRequestOptions();
    return this.httpClient.get<interfaces.IOpportunitySubscriptionsResponse>(url, options);
  }
}
