import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ICollection } from '@apollo/api/discovery/summary-cards';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

export const PERSISTED_COLLECTION_SERVICE_API_URL = new InjectionToken<string>('PersistedCollectionServiceApiUrl');

@Injectable({
  providedIn: 'root'
})
export class SelectionPersistenceService {

  private persistedCollectionUrl = '';

  constructor(
    private httpClient: HttpClient,
    private readonly environment: SecureEnvironmentService,
    @Inject(PERSISTED_COLLECTION_SERVICE_API_URL) private readonly persistedCollectionServiceApiUrl: string
  ) {
    this.persistedCollectionUrl = `${this.persistedCollectionServiceApiUrl}/persisted-collection`
  }

  private getRequestOptions() {
    const headers = {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json'
    };
    return { headers };
  }

  public saveSelection(selection: ICollection): Observable<string> {
    const options = this.getRequestOptions();
    (options as any).responseType = 'text';
    return this.httpClient.post<string>(this.persistedCollectionUrl, selection, options);
  }

  public getUserCollections(): Observable<Array<string>> {
    const options = this.getRequestOptions();
    return this.httpClient.get<Array<string>>(this.persistedCollectionUrl, options);
  }

}
