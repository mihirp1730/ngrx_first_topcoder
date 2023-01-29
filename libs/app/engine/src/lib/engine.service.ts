import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { IEngineSession } from '@apollo/api/interfaces';
import { Observable } from 'rxjs';

export const SESSION_SERVICE_API_URL = new InjectionToken<any>('SessionServiceApiUrl');

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  constructor(private httpClient: HttpClient, @Inject(SESSION_SERVICE_API_URL) private sessionServiceApi: string) {
    console.log('session', sessionServiceApi);
    // Attach delete session to the window object since we do not have an UI element tied to this function yet.
    (window as any)['atlasEngineServiceDebugDelete'] = () => this.deleteDeleteSession();
  }

  public getNewSession(): Observable<IEngineSession.ISessionLayoutResponseMessage> {
    return this.httpClient.get<IEngineSession.ISessionLayoutResponseMessage>(`${this.sessionServiceApi}/NewSession`);
  }

  public postChangeSessionComponent(newComponent): Observable<IEngineSession.ISessionLayoutResponseMessage> {
    return this.httpClient.post<IEngineSession.ISessionLayoutResponseMessage>(
      `${this.sessionServiceApi}/ChangeSessionComponent`,
      newComponent
    );
  }

  public postChangeSessionComponentInstanceData(payload): Observable<any> {
    return this.httpClient.post(`${this.sessionServiceApi}/ChangeSessionComponentInstanceData`, payload);
  }

  public deleteDeleteSession(): Observable<IEngineSession.ISessionLayoutResponseMessage> {
    return this.httpClient.delete<IEngineSession.ISessionLayoutResponseMessage>(`${this.sessionServiceApi}/DeleteSession`);
  }
}
