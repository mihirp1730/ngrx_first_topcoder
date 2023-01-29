import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthConfig, DelfiGuiAuthConfig } from '@apollo/api/interfaces';
import { AppAuthCodeflowModule, AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { DelfiGuiAuthConfigService, DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SESSION_SERVICE_API_URL } from '@apollo/app/engine';
import { AppFeatureFlagModule } from '@apollo/app/feature-flag';
import { METADATA_SERVICE_API_URL } from '@apollo/app/metadata';
import { SecureEnvironmentServiceModule, SECURE_ENVIRONMENT_SERVICE_API_URL } from '@apollo/app/secure-environment';
import { AppServicesCommunicationModule } from '@apollo/app/services/communication';
import { APP_BASE_URL_CONSUMER, CONSUMER_SUBSCRIPTION_SERVICE_API_URL } from '@apollo/app/services/consumer-subscription';
import { CONTENT_SERVICE_API_URL } from '@apollo/app/services/content';
import { DATA_PACKAGES_SERVICE_API_URL, GATEWAY_BASE_URL } from '@apollo/app/services/data-packages';
import { DATA_SUBSCRIPTION_SERVICE_API_URL } from '@apollo/app/services/data-subscription';
import { AppServicesDataVendorModule } from '@apollo/app/services/data-vendor';
import { AppServicesMediaDocumentUploaderModule, COMMON_FILE_MANAGER_URL } from '@apollo/app/services/media-document-uploader';
import {
  AppServicesMediaDownloadModule,
  MEDIA_FILE_DOWNLOAD_API_URL,
  MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL
} from '@apollo/app/services/media-download';
import {
  APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE,
  ATTENDEE_FILE_DOWNLOAD_SERVICE,
  OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
  OPPORTUNITY_REQUEST_ATTENDEE_API_URL,
  OPPORTUNITY_SUBSCRIPTION_ATTENDEE_API_URL,
  OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL
} from '@apollo/app/services/opportunity-attendee';
import { SettingsService, SETTINGS_SERVICE_API_URL, TM_CONSUMER_DETAILS } from '@apollo/app/settings';
import { TrafficManagerServiceModule, TRAFFIC_MANAGER_CONFIGURATION } from '@apollo/app/traffic-manager';
import { AppUiNotificationModule } from '@apollo/app/ui/notification';
import { AppUsersnapModule } from '@apollo/app/usersnap';
import { APP_BASE_URL } from '@apollo/app/vendor';
import { WhatfixModule } from '@apollo/app/whatfix';
import { DelfiGuiAuthModule, DelfiUserProfileModule } from '@delfi-gui/components';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SLB_THEMING_OPTIONS } from '@slb-dls/angular-material/core';
import { SlbLogoutModule } from '@slb-dls/angular-material/logout';
import { SlbNavigationFrameworkModule } from '@slb-dls/angular-material/navigation-framework';
import { GisCanvasModule } from '@slb-innersource/gis-canvas';
import { CookieService } from 'ngx-cookie-service';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { QuillModule } from 'ngx-quill';
import { take } from 'rxjs/operators';

import { env, environment } from '../environments/environment';
import { ENV } from '../environments/environment.provider';
import { AccessDeniedComponent, MAP_BASE_URL } from './access-denied/access-denied.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent, HOST_APP_URL } from './app.component';
import { CookiesAcceptanceComponent } from './cookies-acceptance/cookies-acceptance-modal.component';
import { UserContextService } from './shared/services/user-context.service';
import { themeConfig } from './themes/theme.config';

@NgModule({
  declarations: [AppComponent, AccessDeniedComponent, CookiesAcceptanceComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AppUsersnapModule,
    GisCanvasModule.forRoot({
      options: {
        deploymentUrl: ''
      }
    }),
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: env.production // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([]),
    SlbNavigationFrameworkModule,
    TrafficManagerServiceModule.forRoot({
      provide: TRAFFIC_MANAGER_CONFIGURATION,
      useFactory: (settingsService: SettingsService) => {
        const trafficManagerCode = settingsService.getTrafficManagerConfig();
        return {
          errorRedirect: environment.trafficManager.errorRedirect,
          trafficManagerUrl: environment.trafficManager.trafficManagerUrl + trafficManagerCode,
          isEnabled: JSON.parse(environment.trafficManager.isEnabled)
        };
      },
      deps: [SettingsService]
    }),
    AppAuthCodeflowModule.forRoot(
      {
        provide: AuthConfig,
        useValue: environment.authConfig
      },
      false
    ),
    AppServicesMediaDownloadModule.forRoot(false),
    AppServicesMediaDocumentUploaderModule.forRoot(false),
    SecureEnvironmentServiceModule.forRoot({
      provide: SECURE_ENVIRONMENT_SERVICE_API_URL,
      useValue: environment.api.metadata
    }),
    AppServicesDataVendorModule.forRoot(),
    AppFeatureFlagModule,
    DelfiUserProfileModule,
    DelfiGuiAuthModule.forRoot(DelfiGuiAuthConfigService),
    AppUiNotificationModule,
    NgxGoogleAnalyticsModule.forRoot(environment.measurementId),
    NgxGoogleAnalyticsRouterModule.forRoot({ include: ['/*'], exclude: [] }),
    MatBadgeModule,
    SlbButtonModule,
    SlbLogoutModule,
    QuillModule.forRoot(),
    WhatfixModule,
    AppServicesCommunicationModule.forRoot({
      webSocketUrl: environment.api.wsCommunicationUrl,
      communicationServiceApiUrl: environment.api.communication,
      protocolName: 'slb-chat'
    })
  ],
  providers: [
    {
      provide: ENV,
      useValue: env
    },
    {
      provide: METADATA_SERVICE_API_URL,
      useValue: environment.api.metadata
    },
    {
      provide: TM_CONSUMER_DETAILS,
      useValue: environment.trafficManagerConfig
    },
    {
      provide: SETTINGS_SERVICE_API_URL,
      useValue: environment.api.metadata
    },
    {
      provide: SESSION_SERVICE_API_URL,
      useValue: environment.api.session
    },
    {
      provide: APP_BASE_URL,
      useValue: environment.api.appBaseUrl
    },
    {
      provide: APP_BASE_URL_CONSUMER,
      useValue: environment.api.appBaseUrl
    },
    {
      provide: DATA_PACKAGES_SERVICE_API_URL,
      useValue: environment.api.dataPackages
    },
    {
      provide: CONSUMER_SUBSCRIPTION_SERVICE_API_URL,
      useValue: environment.api.consumerSubscriptions
    },
    {
      provide: DATA_SUBSCRIPTION_SERVICE_API_URL,
      useValue: environment.api.dataSubscription
    },
    {
      provide: GATEWAY_BASE_URL,
      useValue: environment.api.appBaseUrl + '/api/gateway'
    },
    {
      provide: CONTENT_SERVICE_API_URL,
      useValue: environment.api.content
    },
    {
      provide: DELFI_USER_CONTEXT,
      useFactory: (config: UserContextService) => {
        return config.userContext;
      },
      deps: [UserContextService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (userContextService: UserContextService, authService: AuthCodeFlowService) => {
        return async (): Promise<any> => {
          const isSignedIn = await authService.isSignedIn().pipe(take(1)).toPromise();
          const user = await authService.getUser().pipe(take(1)).toPromise();

          // If is signed in and is a real user, get the context
          if (isSignedIn && !user.isGuest) {
            return userContextService.loadContext().toPromise();
          }
        };
      },
      deps: [UserContextService, AuthCodeFlowService],
      multi: true
    },
    {
      provide: DelfiGuiAuthConfig,
      useValue: environment.delfiGuiAuthConfig
    },
    {
      provide: MEDIA_FILE_DOWNLOAD_API_URL,
      useValue: environment.api.commonFileManager
    },
    {
      provide: COMMON_FILE_MANAGER_URL,
      useValue: environment.api.commonFileManager
    },
    {
      provide: ATTENDEE_FILE_DOWNLOAD_SERVICE,
      useValue: environment.api.content
    },
    {
      provide: OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
      useValue: environment.api.opportunityAttendee
    },
    {
      provide: APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE,
      useValue: environment.api.opportunityGatewayAttendee
    },
    { provide: SLB_THEMING_OPTIONS, useValue: themeConfig },
    {
      provide: OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL,
      useValue: environment.api.opportunitySubscriptionRequest
    },
    {
      provide: OPPORTUNITY_REQUEST_ATTENDEE_API_URL,
      useValue: environment.api.opportunityRequestsAttendee
    },
    {
      provide: OPPORTUNITY_SUBSCRIPTION_ATTENDEE_API_URL,
      useValue: environment.api.opportunitySubscriptionsAttendee
    },
    {
      provide: MAP_BASE_URL,
      useValue: environment.api.appBaseUrl + '/map'
    },
    {
      provide: MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL,
      useValue: environment.api.multipleFileDownload
    },
    {
      provide: HOST_APP_URL,
      useValue: environment.api.hostAppUrl
    },
    CookieService
  ],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
