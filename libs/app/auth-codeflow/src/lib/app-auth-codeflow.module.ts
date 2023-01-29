import { CommonModule, Location } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { AuthConfig } from '@apollo/api/interfaces';
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import { take } from 'rxjs';

import { AuthCodeFlowService, AUTOMATIC_LOGIN } from './auth-codeflow.service';
import { AuthenticationInterceptorService } from './authentication-interceptor.service';

@NgModule({
  imports: [CommonModule]
})
export class AppAuthCodeflowModule {
  static forRoot(authConfigProvider: Provider, automaticLogin: boolean): ModuleWithProviders<AppAuthCodeflowModule> {
    return {
      ngModule: AppAuthCodeflowModule,
      providers: [
        authConfigProvider,
        {
          provide: AuthCodeFlowService,
          deps: [AuthConfig, Location],
          useFactory: AppAuthCodeflowModule.AuthCodeFlowServiceFactory
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthenticationInterceptorService,
          multi: true
        },
        {
          provide: AUTOMATIC_LOGIN,
          useValue: automaticLogin
        },
        {
          provide: APP_INITIALIZER,
          useFactory: (authCodeFlowService: AuthCodeFlowService, autoLogin: boolean) => {
            return async (): Promise<any> => {
              const isSignedIn = await authCodeFlowService.isSignedIn().pipe(take(1)).toPromise();
              if (!isSignedIn) {
                if (autoLogin) {
                  return authCodeFlowService.init();
                }
              }
              Promise.resolve();
            };
          },
          deps: [AuthCodeFlowService, AUTOMATIC_LOGIN],
          multi: true
        }
      ]
    };
  }
  static AuthCodeFlowServiceFactory(authConfig: AuthConfig, ngLocation: Location): AuthCodeFlowService {
    const channel = new BroadcastChannel('RefreshToken');
    const elector = createLeaderElection(channel, {
      fallbackInterval: 500, // optional configuration for how often will renegotiation for leader occur
      responseTime: 200 // optional configuration for how long will instances have to respond
    });
    const xmHttpRequestFactory = () => new XMLHttpRequest();
    const locationRef = location;
    const authCodeFlowService = new AuthCodeFlowService(channel, elector, authConfig, xmHttpRequestFactory, ngLocation, locationRef);
    authCodeFlowService.checkUserTokenInfo();
    return authCodeFlowService;
  }
}
