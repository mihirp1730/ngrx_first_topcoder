import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, InjectionToken } from '@angular/core';

import { ITrafficManagerConfiguration, ITrafficManagerService } from './interfaces';

export const HistoryRefToken = new InjectionToken('HistoryRef');
export const JwtDecoderToken = new InjectionToken('JwtDecoder');
export const LocalStorageToken = new InjectionToken('LocalStorage');
export const LocationRefToken = new InjectionToken('LocationRef');
export const SetTimeoutFactoryToken = new InjectionToken('SetTimeoutFactory');

@Injectable({
  providedIn: 'root'
})
export class TrafficManagerService implements ITrafficManagerService {
  private readonly FIVE_MINUTES = 5 * 60 * 1000;
  private readonly THIRTY_MINUTES = 30 * 60 * 1000;
  private readonly STORAGE_KEY: string = 'traffic-manager-token';

  constructor(
    @Inject(DOCUMENT)
    public readonly document: Document,
    @Inject(HistoryRefToken)
    public readonly historyRef: History,
    @Inject(JwtDecoderToken)
    public readonly jwtDecode: (token: string) => { exp: number },
    @Inject(LocalStorageToken)
    public readonly localStorage: Storage,
    @Inject(LocationRefToken)
    public readonly locationRef: Location,
    @Inject(SetTimeoutFactoryToken)
    public readonly setTimeoutFactory: () => typeof setTimeout
  ) {
  }

  public initialize(configuration: ITrafficManagerConfiguration): Promise<void> {
    return new Promise((resolve, reject) => {

      if (!configuration.isEnabled) {
        return resolve();
      }

      const searchParam = new URL(this.locationRef.toString()).searchParams;

      if (!searchParam.has('traffic-manager-code')) {
        if (!this.validateTokenExpiration(this.getToken())) {
          const originalUrl = new URL(this.locationRef.toString());
          if (originalUrl.pathname.includes('create-data-package') || originalUrl.pathname.includes('view-entitlements-details')) {
            this.locationRef.href = configuration.trafficManagerUrl + '?path=' + originalUrl.pathname;
          } else {
            this.locationRef.href = configuration.trafficManagerUrl;
          }
          return reject('Redirect to the traffic manager');
        }
        return resolve();
      }

      const code = Number(searchParam.get('traffic-manager-code'));
      if (code !== 200) {
        this.locationRef.href = configuration.errorRedirect;
        return reject(`wrong traffic manager code ${code}`);
      }

      const token = searchParam.get('traffic-manager-token');
      if (!token) {
        this.locationRef.href = configuration.errorRedirect;
        return reject('missing traffic-manager-token');
      }
      this.setToken(token);

      this.historyRef.pushState('', this.document.title, this.locationRef.pathname);

      resolve();

    });
  }

  public getToken(): string {
    return this.localStorage.getItem(this.STORAGE_KEY);
  }

  public setToken(token: string) {
    const jwt: { exp: number } = { exp: -1 };
    if (this.tryGetExpiration(token, jwt)) {
      this.localStorage.setItem(this.STORAGE_KEY, token);
      this.setExpirationHandler(jwt.exp);
    }
  }

  public validateTokenExpiration(token: string): boolean {
    const jwt: { exp: number } = { exp: -1 };
    if (this.tryGetExpiration(token, jwt)) {
      return this.getExpirationInMs(jwt.exp) > this.THIRTY_MINUTES;
    }
    return false;
  }

  private setExpirationHandler(exp: number): void {
    const setTimeoutMethod = this.setTimeoutFactory();
    setTimeoutMethod(() => {
      this.localStorage.removeItem(this.STORAGE_KEY);
      this.locationRef.reload();
    }, this.getExpirationInMs(exp));
  }

  private getExpirationInMs(exp: number): number {
    const expiresIn = exp * 1000 - Math.round(new Date().getTime());
    return expiresIn - this.FIVE_MINUTES;
  }

  private tryGetExpiration(token: string, jwt: { exp: number }): boolean {
    try {
      const parsed = this.jwtDecode(token);
      jwt.exp = parsed.exp;
      return true;
    } catch (e) {
      return false;
    }
  }
}
