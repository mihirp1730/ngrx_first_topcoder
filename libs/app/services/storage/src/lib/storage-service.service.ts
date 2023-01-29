import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IStorageRequest } from '@apollo/api/interfaces';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { catchError, Observable, of } from 'rxjs';

export const STORAGE_SERVICE_SERVICE_API_URL = new InjectionToken<string>('StorageServiceApiUrl');

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageServiceUrl = '';

  constructor(
    private http: HttpClient,
    private readonly environment: SecureEnvironmentService,
    @Inject(STORAGE_SERVICE_SERVICE_API_URL) private readonly storageServiceApiUrl: string
  ) {
    this.storageServiceUrl = `${storageServiceApiUrl}/store`;
  }

  private getRequestOptions() {
    const headers = {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json'
    };
    return { headers };
  }

  saveItems(items: {[key: string]: any}): Observable<void> {
    const options = this.getRequestOptions();
    const payload = {
      items,
      includePartition: false
    } as IStorageRequest;
    return this.http.post<void>(this.storageServiceUrl, payload, options).pipe(
      catchError(() => of())
    );
  }

  getItems(keys: Array<string>): Observable<{[key: string]: string}> {
    const options = this.getRequestOptions();
    (options as any).params = new HttpParams().appendAll({keys});
    return this.http.get<{[key: string]: string}>(this.storageServiceUrl, options).pipe(
      catchError(() => of({}))
    );
  }

}
