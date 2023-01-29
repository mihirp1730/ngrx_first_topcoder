import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IMapConfiguration, IMapSettings } from '@apollo/api/interfaces';
import { WindowRef } from '@apollo/app/ref';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const SETTINGS_SERVICE_API_URL = new InjectionToken<any>('SettingsServiceApiUrl');
export const TM_CONSUMER_DETAILS = new InjectionToken<any>('trafficManagerConfig');

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(
    private http: HttpClient,
    @Inject(SETTINGS_SERVICE_API_URL) private readonly settingsServiceApi: string,
    @Inject(TM_CONSUMER_DETAILS) private readonly trafficManagerConfig: string,
    private readonly windowRef: WindowRef
  ) {}

  public getSettings(): Observable<IMapSettings> {
    return this.http.get<IMapSettings>(`${this.settingsServiceApi}/map`).pipe(catchError((e) => of({} as unknown as IMapSettings)));
  }

  public getExclusiveMapConfig(): Observable<IMapConfiguration> {
    return this.http.get<IMapSettings>(`${this.settingsServiceApi}/map-config`).pipe(catchError((e) => of({} as unknown as any)));
  }

  public getConsumerAppUrl(vendorid: string): Observable<{ data: string }> {
    const headers = { vendorid };
    return this.http.get<string>(`${this.settingsServiceApi}/consumer-url`, { headers }).pipe(catchError((e) => of({} as unknown as any)));
  }

  public getTrafficManagerConfig() {
    try {
      const parsedConsumerDetails = JSON.parse(this.trafficManagerConfig.replace(/'/g, '"'));
      const currentConsumer = parsedConsumerDetails.find(
        (details) => details.consumerURL === this.windowRef.nativeWindow.location.hostname
      );
      return currentConsumer.trafficManagerCode;
    } catch (error) {
      console.error('TM code parsing failed ', this.trafficManagerConfig);
    }
  }
}
