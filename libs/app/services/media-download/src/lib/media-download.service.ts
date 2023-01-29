import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { IVendorProfile, VendorAppService } from '@apollo/app/vendor';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MediaDownload } from './ineterface/media.download.interface';

export const MEDIA_FILE_DOWNLOAD_API_URL = new InjectionToken<string>('MediaFileDownloadAPI_URL');
export const MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL = new InjectionToken<string>('MultipleMediaFileDownloadAPI_URL');
export const IS_BILLING_ACCOUNT_ID_REQUIRED = new InjectionToken<boolean>('IsBilingAccountIdRequired');

@Injectable({
  providedIn: 'root'
})
export class MediaDownloadService {
  private appKey: string;
  constructor(
    private httpClient: HttpClient,
    private readonly environment: SecureEnvironmentService,
    private vendorAppService: VendorAppService,
    @Inject(MEDIA_FILE_DOWNLOAD_API_URL) private readonly MediaFileDownloadAPI_URL: string,
    @Inject(MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL) private readonly multipleMediaFileDownloadAPI_URL: string,
    @Inject(IS_BILLING_ACCOUNT_ID_REQUIRED) private readonly isBilingAccountIdRequired: boolean,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel
  ) {}

  public downloadMedia(fileId: string): Observable<string | null> {
    const options = this.getRequestOptions();
    // billing account Id is required only in Vendor access
    if (!this.isBilingAccountIdRequired) {
      delete (options.headers as unknown as any).billingAccountId;
    }

    return this.httpClient.get<{ signedURL: string }>(`${this.MediaFileDownloadAPI_URL}/${fileId}/download`, options).pipe(
      map(({ signedURL }) => {
        return signedURL;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  //This call is direct URL call, don't need to add anything other than direct download URL.
  public downloadLogoImageSrc(vendorProfile: IVendorProfile): Observable<string | null> {
    const options = this.getRequestOptions();
    const downloadURL = vendorProfile?.companyLogo?.url;
    options.headers.billingAccountId = vendorProfile?.billingAccountId; // Getting bilingAccountId from API response

    return this.httpClient.get<{ signedURL: string }>(`${downloadURL}`, options).pipe(
      map(({ signedURL }) => {
        return signedURL;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  public downloadMultipleMedia(fileId: string[]): Observable<MediaDownload[] | null> {
    const options = this.getRequestOptions();

    return this.httpClient.post<MediaDownload[]>(`${this.multipleMediaFileDownloadAPI_URL}`, fileId, options).pipe(
      map((signedUrls) => {
        return signedUrls;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  private getRequestOptions() {
    const headers = {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json',
      billingAccountId: this.vendorAppService?.userContext?.crmAccountId || this.userContext.crmAccountId
    };
    return { headers };
  }
}
