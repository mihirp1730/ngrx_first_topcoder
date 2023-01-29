import { Location as NgLocation } from '@angular/common';
import { Injectable, InjectionToken } from '@angular/core';
import { AuthConfig, AuthUser } from '@apollo/api/interfaces';
import { BroadcastChannel, LeaderElector } from 'broadcast-channel';
import * as jwtDecode from 'jwt-decode';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { filter } from 'rxjs/operators';

export const AUTOMATIC_LOGIN = new InjectionToken<boolean>('AutomaticLogin');

@Injectable()
export class AuthCodeFlowService {
  isSignIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  user$: BehaviorSubject<AuthUser> = new BehaviorSubject<AuthUser>(null);

  public isLeader = false;

  constructor(
    public readonly channel: BroadcastChannel,
    public readonly elector: LeaderElector,
    public readonly config: AuthConfig,
    public readonly xmlHttpRequestFactory: () => XMLHttpRequest,
    public readonly ngLocation: NgLocation,
    public readonly locationRef: Location
  ) {
    this.channel.onmessage = (msg) => {
      this.handleChannelMessage(msg);
    };
    this.elector.awaitLeadership().then(() => {
      this.isLeader = true;
      this.channel.postMessage('New leader is set');
    });
    this.elector.onduplicate = () => {
      this.locationRef.reload();
    };
  }

  public handleChannelMessage(msg: any) {
    if (msg === 'Refresh token finished') {
      this.locationRef.reload();
    }
    if (msg === 'New leader is set') {
      this.isLeader = false;
    }
    if (msg === 'User sign out') {
      this.locationRef.reload();
    }
  }

  public async init(): Promise<void> {
    let signInUser = false;
    const result = this.getUserTokenInfo();

    if (!result?.access_token) {
      // If there is no access token, redirect to login page
      signInUser = true;
    } else {
      if (!result.id_token) {
        // If id token is not in the response, we use the previous value
        const user = this.user$.getValue();
        if (!user.isGuest) {
          result.id_token = user.idToken;
        } else {
          // If there is no user value, redirect to login page
          signInUser = true;
        }
      }

      this.setUserInfo(result);
    }

    if (signInUser) {
      await this.signIn();
      return Promise.reject('User is not signed in.');
    }

    return Promise.resolve();
  }

  public signIn(redirectUrl = ''): Promise<AuthUser> {
    const redirect = this.ngLocation.prepareExternalUrl(`/${redirectUrl}`);
    const state = `state=xxx;${encodeURIComponent(redirect)}`;
    const url = `${this.config.authProxyApi}/login?${state}`;
    this.locationRef.assign(url);
    return Promise.resolve(null);
  }

  public getUser(): Observable<AuthUser> {
    return this.user$.asObservable().pipe(filter((value) => value !== null));
  }

  public isSignedIn(): Observable<boolean> {
    return this.isSignIn$.asObservable().pipe(filter((value) => value !== null));
  }

  public signOut(redirectUrl?: string): Promise<void> {
    this.channel.postMessage('User sign out');
    const logoutUrl = new URL(`${this.config.authProxyApi}/logout`);
    const user = this.user$.getValue();
    if (!user.isGuest) {  // if current user is a logged user, we do sign out
      logoutUrl.searchParams.set('id_token', user.idToken);
      if (redirectUrl) {
        logoutUrl.searchParams.set('redirect_url', redirectUrl);
      }
      this.locationRef.assign(logoutUrl.toString());
    }
    return Promise.resolve();
  }

  public setRefreshTokenTimer(accessToken: string) {
    const decodedToken: any = jwtDecode(accessToken);
    const now = new Date().getTime();
    let countDown = Number(decodedToken.exp) * 1000 - now - this.config.timeoutInterval * 60 * 1000;
    if (countDown <= 0) {
      // this means the expire time in frontend is shorter than the expire time in backend. Probably some setting error.
      // we can set count down time to 5 mins so that we can try to refresh the token again after 5 mins.
      countDown = 5 * 60 * 1000;
    }
    timer(countDown).subscribe(() => {
      if (this.isLeader) {
        this.checkUserTokenInfo();
        this.channel.postMessage('Refresh token finished');
      }
    });
  }

  public checkUserTokenInfo() {
    const result = this.getUserTokenInfo();
    this.setUserInfo(result);
  }

  private getUserTokenInfo() {
    let result;
    try {
      const url = `${this.config.authProxyApi}/token`;
      const xmlHttpRequest = this.xmlHttpRequestFactory();

      xmlHttpRequest.open('GET', url, false);
      xmlHttpRequest.overrideMimeType('application/json');
      xmlHttpRequest.send();
      if (xmlHttpRequest.status === 400) {
        return;
      }
      if (xmlHttpRequest.status !== 200) {
        throw new Error('Auth: Token Endpoint Call Failure');
      }
      result = JSON.parse(xmlHttpRequest.responseText);
    } catch (e) {
      console.log(e.message);
    }
    return result;
  }

  private setUserInfo(result: any) {
    if (result?.access_token) {
      if (result.id_token) {  // is an identified user
        this.user$.next({
          name: result.name,
          email: result.email,
          company: result.hd,
          accessToken: result.access_token,
          idToken: result.id_token,
          isGuest: false,
          gisToken: result.gis_token
        });
      } else {  // is a guest user
        this.user$.next({
          name: 'Guest',
          email: '',
          company: '',
          accessToken: result.access_token,
          idToken: '',
          isGuest: true,
          gisToken: result.gis_token

        });
      }
      this.isSignIn$.next(true);
      this.setRefreshTokenTimer(result.access_token);
    } else {
      this.user$.next({
        name: '',
        email: '',
        company: '',
        accessToken: '',
        idToken: '',
        isGuest: false,
        gisToken: ''
      });
      this.isSignIn$.next(false);
    }
  }
}
