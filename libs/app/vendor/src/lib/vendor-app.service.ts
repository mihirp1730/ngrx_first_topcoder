import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { SettingsService } from '@apollo/app/settings';
import { UserService } from '@delfi-gui/components';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';

import * as interfaces from './interfaces/vendor-app.interface';

export const APP_BASE_URL = new InjectionToken<any>('appBaseUrl');
export const DATA_VENDORS_DETAILS = new InjectionToken<interfaces.IDataVendor[]>('dataVendor');

@Injectable({
  providedIn: 'root'
})
export class VendorAppService {
  private appKey = '';
  private cachedVendors$: Observable<interfaces.IDataVendor[]>;
  private vendors = null;
  private context = null;
  private consumerUrl = new BehaviorSubject<string>('');
  public consumerUrl$ = this.consumerUrl.asObservable();

  constructor(
    @Inject(APP_BASE_URL) private readonly appBaseUrl: string,
    private httpClient: HttpClient,
    private secureEnvironmentService: SecureEnvironmentService,
    private userService: UserService,
    private settingsService: SettingsService
  ) {
    this.appKey = this.secureEnvironmentService.secureEnvironment?.app.key ?? '';
  }

  get dataVendors(): interfaces.IDataVendor {
    return this.vendors;
  }

  get userContext(): ContextModel {
    return this.context;
  }

  private getParams(path: string, billingAccountId?: boolean) {
    const url = this.appBaseUrl + path;
    const headers = {
      appKey: this.appKey,
      'Content-Type': 'application/json'
    };

    let params;
    if (billingAccountId) {
      params = new HttpParams().set('billingAccountId', this.context.crmAccountId);
    }
    const options = { headers, params };
    return { url, options };
  }

  public retrieveVendorProfile(dataVendorId: string): Observable<interfaces.IVendorProfile> {
    const path = `/data-vendors/${dataVendorId}/profile`;
    const { options, url } = this.getParams(path);
    return this.httpClient.get<interfaces.IVendorProfile>(url, options).pipe(catchError(() => of(null)));
  }

  public retrieveDataVendors(billingAccountFilter?: boolean): Observable<interfaces.IDataVendor[]> {
    if (!this.cachedVendors$) {
      const path = `/data-vendors/`;
      return this.userService.getContext().pipe(
        mergeMap((context) => {
          this.context = context;
          const { options, url } = this.getParams(path, billingAccountFilter);
          return (this.cachedVendors$ = this.httpClient.get<interfaces.IRetrieveDataVendorsResponse>(url, options).pipe(
            shareReplay(1),
            map((response) => {
              this.retrieveAssociatedConsumerAppUrl(response?.dataVendors[0]?.dataVendorId);
              this.vendors = response.dataVendors;
              return response.dataVendors;
            }),
            catchError(() => of(null))
          ));
        })
      );
    } else {
      return this.cachedVendors$;
    }
  }

  public retrieveVendorContactPerson(dataVendorId: string): Observable<interfaces.IVendorContactDetails[]> {
    const path = `/data-vendors/${dataVendorId}/contact-person`;
    const { options, url } = this.getParams(path);

    return this.httpClient
      .get<{ contactPersons: interfaces.IVendorContactDetails[] }>(url, options)
      .pipe(map((response) => response.contactPersons));
  }

  public retrieveAssociatedConsumerAppUrl(vendorId): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.settingsService
        .getConsumerAppUrl(vendorId)
        .pipe()
        .subscribe((url) => {
          this.consumerUrl.next(url.data);
          resolve(url.data);
        });
    });
  }
}
