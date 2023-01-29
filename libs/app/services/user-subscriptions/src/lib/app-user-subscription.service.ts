import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import * as buildUrl from 'build-url';
import { Observable } from 'rxjs';
import { IUserSubscriptionResponse } from './interfaces/app-user-subscription.interface';

export const APP_CCM_SERVICE_HOST = new InjectionToken<any>('appCCMServiceHost');
export const AT_APP_Code = new InjectionToken<any>('assetTransactionAppCode');

@Injectable({
  providedIn: 'root'
})
export class UserSubscriptionService {
  constructor(
    private httpClient: HttpClient,
    @Inject(APP_CCM_SERVICE_HOST) private readonly appCCMServiceUrl: string,
    @Inject(AT_APP_Code) private readonly assetTransactionAppCode: string,
    private readonly environment: SecureEnvironmentService
  ) {}

  public getUserSubscription(): Observable<IUserSubscriptionResponse> {
    const url = `${this.appCCMServiceUrl}/userSubscription/v2/userSubscriptions`;
    const urlWithParams = buildUrl(url, {
      queryParams: {
        appCode: this.assetTransactionAppCode
      }
    });

    const headers = this.prepareHeaders();

    return this.httpClient.get<IUserSubscriptionResponse>(urlWithParams, { headers });
  }

  private prepareHeaders() {
    return {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json'
    };
  }
}
