import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { VendorAppService } from '@apollo/app/vendor';
import { forkJoin, map, Observable } from 'rxjs';

import { DATA_VENDORS_DETAILS, IDataVendor } from '@apollo/app/vendor';
import * as interfaces from './interfaces/opportunity.interface';

export const OPPORTUNITY_SERVICE_API_URL = new InjectionToken<string>('OpportunityServiceApiUrl');
export const OPPORTUNITY_SUBSCRIPTION_API_URL = new InjectionToken<string>('opportunitySubscriptionsUrl');
export const OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL = new InjectionToken<string>('opportunitySubscriptionsRequestUrl');
export const OPPORTUNITY_MAP_REP_SERVICE_API_URL = new InjectionToken<string>('opportunityMapRepServiceApiUrl');
export const GATEWAY_BASE_URL_FOR_OPPORTUNITY = new InjectionToken<string>('gatewayBaseUrl');
export const OPPORTUNITY_ATTENDEE_SERVICE_API_URL = new InjectionToken<string>('opportunityAttendeeServiceApiUrl');
export const APP_OPPORTUNITY_BASE_URL = new InjectionToken<any>('appBaseUrl');

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  constructor(
    private httpClient: HttpClient,
    private readonly environment: SecureEnvironmentService,
    public domSanitizer: DomSanitizer,
    @Inject(OPPORTUNITY_SERVICE_API_URL) private readonly opportunityServiceApiUrl: string,
    @Inject(OPPORTUNITY_SUBSCRIPTION_API_URL) private readonly opportunitySubscriptionsUrl: string,
    @Inject(OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL) private readonly opportunitySubscriptionsRequestUrl: string,
    @Inject(GATEWAY_BASE_URL_FOR_OPPORTUNITY) private readonly gatewayBaseUrl: string,
    @Inject(OPPORTUNITY_MAP_REP_SERVICE_API_URL) private readonly opportunityMapRepServiceApiUrl: string,
    private vendorAppService: VendorAppService,
    @Inject(OPPORTUNITY_ATTENDEE_SERVICE_API_URL) private readonly opportunityAttendeeServiceApiUrl: string,
    @Inject(APP_OPPORTUNITY_BASE_URL) private readonly appBaseUrl: string,
    @Inject(DATA_VENDORS_DETAILS) private readonly dataVendorDetails: IDataVendor[]
  ) {}

  private prepareHeaders() {
    /* istanbul ignore next */
    if (this.vendorAppService?.dataVendors !== null)
      return {
        appKey: this.environment.secureEnvironment.app.key,
        'Content-Type': 'application/json',
        vendorId: this.vendorAppService?.dataVendors[0]?.dataVendorId || this.dataVendorDetails?.[0].dataVendorId
      };
  }

  /**
   * Method to create opportunity with name
   * @param {string} opportunityName The name of the opportunity to create
   * @returns {ICreateOpportunityResponse} Response of the API call with the information
   */
  public createOpportunity(payload: interfaces.ICreateOpportunityRequest): Observable<interfaces.ICreateOpportunityResponse> {
    const url = `${this.opportunityServiceApiUrl}`;
    const body: interfaces.ICreateOpportunityRequest = payload;
    const headers = this.prepareHeaders();

    return this.httpClient.post<interfaces.ICreateOpportunityResponse>(url, body, { headers });
  }

  public getOpportunityList(): Observable<interfaces.IGetOpportunityResponse> {
    const url = `${this.opportunityServiceApiUrl}`;
    const headers = this.prepareHeaders();
    return this.httpClient.get<interfaces.IGetOpportunityResponse>(url, { headers });
  }

  public getOpportunityById(opportunityId: string): Observable<interfaces.IOpportunity> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}`;
    const headers = this.prepareHeaders();
    return this.httpClient.get<interfaces.IOpportunity>(url, { headers });
  }

  public getMapRepresentationById(opportunityId: string): Observable<interfaces.IOpportunityMapRepresentationResponse> {
    const url = `${this.opportunityMapRepServiceApiUrl}/${opportunityId}/map-representations`;
    const headers = this.prepareHeaders();
    return this.httpClient.get<interfaces.IOpportunityMapRepresentationResponse>(url, { headers });
  }

  public deleteMapRepresentation(
    opportunityId: string,
    mapRepresentationId: string
  ): Observable<interfaces.IOpportunityDeleteMapRepresentationResponse> {
    const url = `${this.opportunityMapRepServiceApiUrl}/${opportunityId}/map-representations/${mapRepresentationId}`;
    const headers = this.prepareHeaders();
    return this.httpClient.delete<{ mapRepresentationId: string }>(url, { headers });
  }

  public deleteOpportunity(opportunityId: string): Observable<void> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}`;
    const headers = this.prepareHeaders();
    return this.httpClient.delete<void>(url, { headers });
  }

  unPublishOpportunity(opportunityId: string): Observable<void> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}/unpublish`;
    const headers = this.prepareHeaders();
    return this.httpClient.post<void>(url, null, { headers });
  }

  saveOpportunityProfile(
    opportunityId: string,
    payload: interfaces.IOpportunityProfile
  ): Observable<interfaces.ISaveOpportunityProfileResponse> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}/opportunity-profile`;
    const body: interfaces.IOpportunityProfile = payload;
    const headers = this.prepareHeaders();
    return this.httpClient.put<interfaces.ISaveOpportunityProfileResponse>(url, body, { headers });
  }

  saveOpportunityConfidentialProfile(
    opportunityId: string,
    payload: interfaces.IOpportunityConfidentialProfile
  ): Observable<interfaces.ISaveOpportunityConfidentialProfileResponse> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}/confidential-opportunity-profile`;
    const body: interfaces.IOpportunityConfidentialProfile = payload;
    const headers = this.prepareHeaders();
    return this.httpClient.put<interfaces.ISaveOpportunityConfidentialProfileResponse>(url, body, { headers });
  }

  saveOpportunity(payload: interfaces.ISaveOpportunity): Observable<interfaces.ICreateOpportunityResponse> {
    const url = `${this.opportunityServiceApiUrl}`;
    const body: interfaces.ISaveOpportunity = payload;
    const headers = this.prepareHeaders();
    return this.httpClient.put<interfaces.ICreateOpportunityResponse>(url, body, { headers });
  }

  saveOpportunitySteps(
    opportunityPayload: interfaces.ISaveOpportunity,
    opprProfilePayload: interfaces.IOpportunityProfile,
    confidentialProfilePayload: interfaces.IOpportunityConfidentialProfile,
    saveAdditionalInfo: interfaces.IOpportunityVDRPayload,
    opportunityId
  ): Observable<
    [
      interfaces.ICreateOpportunityResponse,
      interfaces.ISaveOpportunityProfileResponse,
      interfaces.ISaveOpportunityConfidentialProfileResponse,
      void
    ]
  > {
    const saveOppr = this.saveOpportunity(opportunityPayload);
    const saveOpprProfile = this.saveOpportunityProfile(opportunityId, opprProfilePayload);
    const saveOpprConf = this.saveOpportunityConfidentialProfile(opportunityId, confidentialProfilePayload);
    const saveOpprAdd = this.addVdrToOpportunity(opportunityId, saveAdditionalInfo);
    return forkJoin([saveOppr, saveOpprProfile, saveOpprConf, saveOpprAdd]);
  }

  createMarketingRepresentation(
    opportunityId: string,
    payload: interfaces.IOpportunityMapRepresentationPayload
  ): Observable<{ mapRepresentationId: string }> {
    const url = `${this.opportunityMapRepServiceApiUrl}/${opportunityId}/map-representations`;
    const headers = this.prepareHeaders();
    return this.httpClient.post<{ mapRepresentationId: string }>(url, payload, { headers });
  }

  publishOpportunity(opportunityId: string): Observable<void> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}/publish`;
    const headers = this.prepareHeaders();
    return this.httpClient.post<void>(url, null, { headers });
  }

  createSubscription(
    payload: interfaces.IOpportunitySubscription
  ): Observable<{ opportunitySubscriptionId: string; opportunitySubscriptionIds: string[] }> {
    const url = `${this.opportunitySubscriptionsUrl}`;
    const headers = this.prepareHeaders();
    return this.httpClient.post<{ opportunitySubscriptionId: string; opportunitySubscriptionIds: string[] }>(url, payload, { headers });
  }

  getOpportunityRequestList(): Observable<interfaces.IOpportunityRequest[]> {
    const url = `${this.gatewayBaseUrl}/opportunity-subscription-request`;
    const headers = this.prepareHeaders();
    return this.httpClient.get<interfaces.IOpportunityRequest[]>(url, { headers });
  }

  getOpportunitySubscriptions(): Observable<interfaces.IOppSubscription[]> {
    const url = `${this.opportunitySubscriptionsUrl}`;
    const headers = this.prepareHeaders();
    return this.httpClient.get<interfaces.IOppSubscription[]>(url, { headers }).pipe(map((res: any) => res.items));
  }

  addVdrToOpportunity(opportunityId: string, payload: interfaces.IOpportunityVDRPayload): Observable<void> {
    const url = `${this.opportunityServiceApiUrl}/${opportunityId}/opportunity-vdr`;
    const body: interfaces.IOpportunityVDRPayload = payload;
    const headers = this.prepareHeaders();
    return this.httpClient.put<void>(url, body, { headers });
  }

  rejectOpportunityRequest(payload: { rejectionReason: string }, subscriptionRequestId: string): Observable<void> {
    const url = `${this.opportunitySubscriptionsRequestUrl}/${subscriptionRequestId}/reject`;
    const headers = this.prepareHeaders();
    // changing responseType to text as api response is not in JSON
    (headers as any).responseType = 'text';
    return this.httpClient.post<void>(url, payload, { headers });
  }

  updateSubscription(payload: interfaces.IOpportunitySubscription): Observable<{ opportunitySubscriptionId: string }> {
    const url = `${this.opportunitySubscriptionsUrl}`;
    const body: interfaces.IOpportunitySubscription = payload;
    const headers = this.prepareHeaders();
    return this.httpClient.put<{ opportunitySubscriptionId: string }>(url, body, { headers });
  }

  getPublicPublishedOpportunities(): Observable<interfaces.IGetOpportunityResponse> {
    const url = `${this.opportunityAttendeeServiceApiUrl}`;
    const headers = this.prepareHeaders();
    return this.httpClient.get<interfaces.IGetOpportunityResponse>(url, { headers });
  }

  getOpportunityConsumerUrl(opportunityId): string {
    return `${this.appBaseUrl}/opportunity/${opportunityId}`;
  }
}
