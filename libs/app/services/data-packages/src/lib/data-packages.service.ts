import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DataPackage } from '@apollo/api/data-packages/consumer';
import { ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import * as buildUrl from 'build-url';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import * as interfaces from './interfaces/data-packages.interface';

export const DATA_PACKAGES_SERVICE_API_URL = new InjectionToken<string>('DataPackagesServiceApiUrl');
export const APP_BASE_URL = new InjectionToken<string>('appBaseUrl');
export const GATEWAY_BASE_URL = new InjectionToken<any>('gatewayBaseUrl');

@Injectable({
  providedIn: 'root'
})
export class DataPackagesService {
  private appKey: string;

  constructor(
    private httpClient: HttpClient,
    private readonly environment: SecureEnvironmentService,
    @Inject(DATA_PACKAGES_SERVICE_API_URL) private readonly dataPackagesApiUrl: string,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    @Inject(GATEWAY_BASE_URL) private readonly gatewayBaseUrl: string
  ) { }

  public createDataPackage(dataPackageName: string): Observable<interfaces.ICreateDataPackageResponse> {
    const url = `${this.dataPackagesApiUrl}`;
    const body: interfaces.ICreateDataPackageRequest = {
      dataPackageName
    };
    const options = this.getRequestOptions();

    return this.httpClient.post<interfaces.ICreateDataPackageResponse>(url, body, options);
  }

  public updatePackageName(payload: interfaces.IUpdatePackageNameRequest): Observable<interfaces.ICreateDataPackageResponse> {
    const url = `${this.dataPackagesApiUrl}`;
    const options = this.getRequestOptions();

    return this.httpClient.put<interfaces.ICreateDataPackageResponse>(url, payload, options);
  }

  public createMarketingRepresentation(
    packageId: string,
    payload: interfaces.ICreateMarketingRepresentationRequest
  ): Observable<interfaces.ICreateMarketingRepresentationResponse> {
    const url = `${this.dataPackagesApiUrl}/${packageId}/marketing-representations`;
    const options = this.getRequestOptions();

    return this.httpClient.post<interfaces.ICreateMarketingRepresentationResponse>(url, payload, options);
  }

  public getMarketingRepresentations(dataPackageId: string): Observable<Array<interfaces.IMarketingRepresentation>> {
    const url = `${this.dataPackagesApiUrl}/${dataPackageId}/marketing-representations`;
    const options = this.getRequestOptions();

    return this.httpClient.get<interfaces.IGetMarketingRepresentationsResponse>(url, options).pipe(
      map((response) => response.marketingRepresentations),
      catchError(() => of([]))
    );
  }

  public deleteMarketingRepresentation(marketingRepresentationId: string): Observable<interfaces.IDeleteMarketingRepresentationsResponse> {
    const url = `${this.dataPackagesApiUrl}/marketing-representations/${marketingRepresentationId}`;
    const options = this.getRequestOptions();
    return this.httpClient.delete<interfaces.IDeleteMarketingRepresentationsResponse>(url, options);
  }

  /**
   * Method to get the information of a data package with an ID given
   * @param {string} dataPackageId The ID of the data package to retrieve
   * @returns {IGetDataPackageResponse} Response of the API call with the information
   */
  public getDataPackage(dataPackageId: string): Observable<interfaces.IGetDataPackageResponse> {
    const url = `${this.dataPackagesApiUrl}/${dataPackageId}`;
    const options = this.getRequestOptions();

    return this.httpClient.get<interfaces.IGetDataPackageResponse>(url, options).pipe(catchError(() => of(null)));
  }

  public getPublishedDataPackageById(dataPackageId: string): Observable<interfaces.IGetDataPackageResponse> {
    const url = `${this.dataPackagesApiUrl}/published-data-packages`;
    const urlWithParams = buildUrl(url, {
      queryParams: {
        dataPackageId: dataPackageId
      }
    });
    const options = this.getRequestOptions();

    // This line needs to be removed once ligh-app & vendor-app interceptors are implemented.
    delete options.headers.billingAccountId;

    return this.httpClient.get<interfaces.IGetPublishedDataPackagesResponse>(urlWithParams, options).pipe(
      map((response) => response.dataPackages[0]),
      catchError(() => of({} as interfaces.IGetDataPackageResponse))
    );
  }

  public publishPackage(packageId: string): Observable<interfaces.IPublishPackageResponse> {
    const url = `${this.dataPackagesApiUrl}/${packageId}/publish`;
    const options = this.getRequestOptions();

    return this.httpClient.post<interfaces.IPublishPackageResponse>(url, null, options);
  }

  public associateDeliverable(
    packageId: string,
    payload: interfaces.IAssociateDeliverableRequest
  ): Observable<interfaces.IAssociateDeliverableResponse> {
    const url = `${this.dataPackagesApiUrl}/${packageId}/data-items`;
    const options = this.getRequestOptions();

    return this.httpClient.post<interfaces.IAssociateDeliverableResponse>(url, payload, options);
  }

  public getAssociateDeliverables(packageId: string): Observable<Array<interfaces.IDataItem>> {
    const url = `${this.dataPackagesApiUrl}/${packageId}/data-items`;
    const options = this.getRequestOptions();

    return this.httpClient.get<interfaces.IRetrieveDeliverableResponse>(url, options).pipe(
      map((response) => response.dataItems),
      catchError(() => of([]))
    );
  }

  public deleteAssociatedDeliverables(packageId: string, dataItemId: string): Observable<void> {
    const url = `${this.dataPackagesApiUrl}/${packageId}/data-items/${dataItemId}`;
    const options = this.getRequestOptions();

    return this.httpClient.delete<void>(url, options);
  }

  public savePackageProfile(
    packageId: string,
    payload: interfaces.ISavePackageProfileRequest
  ): Observable<interfaces.ISavePackageProfileResponse> {
    const url = `${this.dataPackagesApiUrl}/${packageId}/data-package-profile`;
    const options = this.getRequestOptions();

    return this.httpClient.put<interfaces.ISavePackageProfileResponse>(url, payload, options);
  }

  // Internal methods

  private getRequestOptions() {
    const headers = {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json',
      billingAccountId: this.userContext?.crmAccountId
    };

    return { headers };
  }

  getDataPackages(body: any = null): Observable<ResultsResponseResult[]> {
    const resultsApi = `${this.gatewayBaseUrl}/vendor/data-packages`;
    const options = this.getRequestOptions();
    return this.httpClient
      .patch<{ totalResults: number; results: ResultsResponseResult[] }>(resultsApi, body, options)
      .pipe(map((response) => response.results));
  }

  getConsumerDataPackage(dataPackageId: string): Observable<DataPackage> {
    const url = `${this.gatewayBaseUrl}/consumer/data-package/${dataPackageId}`;
    const options = this.getRequestOptions();
    return this.httpClient.get<DataPackage>(url, options);
  }

  deleteDraftPackage(dataPackageId: string): Observable<any> {
    const url = `${this.dataPackagesApiUrl}/${dataPackageId}`;
    const options = this.getRequestOptions();
    return this.httpClient.delete<any>(url, options);
  }

  unpublishPackage(dataPackageId: string): Observable<any> {
    const url = `${this.dataPackagesApiUrl}/${dataPackageId}/unpublish`;
    const options = this.getRequestOptions();
    return this.httpClient.post<any>(url, null, options);
  }

}
