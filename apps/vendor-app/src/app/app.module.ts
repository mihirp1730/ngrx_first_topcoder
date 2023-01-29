import { APP_BASE_URL, DATA_VENDORS_DETAILS, VendorAppService } from '@apollo/app/vendor';
import { APP_CCM_SERVICE_HOST, AT_APP_Code } from '@apollo/app/services/user-subscriptions';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { APP_OPPORTUNITY_BASE_URL, GATEWAY_BASE_URL_FOR_OPPORTUNITY, OPPORTUNITY_ATTENDEE_SERVICE_API_URL, OPPORTUNITY_MAP_REP_SERVICE_API_URL, OPPORTUNITY_SERVICE_API_URL, OPPORTUNITY_SUBSCRIPTION_API_URL, OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL } from '@apollo/app/services/opportunity';
import { AccessDeniedComponent, DELFI_PORTAL_APP } from './access-denied/access-denied.component';
import { AppAuthCodeflowModule, AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { AppServicesMediaDocumentUploaderModule, COMMON_FILE_MANAGER_URL } from '@apollo/app/services/media-document-uploader';
import { AppServicesMediaDownloadModule, MEDIA_FILE_DOWNLOAD_API_URL, MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL } from '@apollo/app/services/media-download';
import { AuthConfig, DelfiGuiAuthConfig } from '@apollo/api/interfaces';
import { DATA_PACKAGES_SERVICE_API_URL, GATEWAY_BASE_URL } from '@apollo/app/services/data-packages';
import { DELFI_USER_CONTEXT, DelfiGuiAuthConfigService } from '@apollo/app/delfi-gui-auth-config';
import { DelfiGuiAuthModule, DelfiGuiOidcModule, DelfiGuiOidcService, DelfiSupportModule, DelfiUserProfileModule } from '@delfi-gui/components';
import { GEOJSON_FILE_VALIDATOR_WORKER_FACTORY, SHAPE_FILE_VALIDATOR_WORKER_FACTORY } from '@apollo/app/shape-file-validator';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { SECURE_ENVIRONMENT_SERVICE_API_URL, SecureEnvironmentServiceModule } from '@apollo/app/secure-environment';
import { SETTINGS_SERVICE_API_URL, TM_CONSUMER_DETAILS } from '@apollo/app/settings';
import { TRAFFIC_MANAGER_CONFIGURATION, TrafficManagerServiceModule } from '@apollo/app/traffic-manager';
import { accessFeatureKey, userAccessReducer } from './access-denied/state/reducers/user-subscription.reducer';
import { commonDataFeatureKey, commonReducer } from './shared/state/reducers/common.reducer';
import { env, environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppFeatureFlagModule } from '@apollo/app/feature-flag';
import { AppRoutingModule } from './app-routing.module';
import { AppServicesCommunicationModule } from '@apollo/app/services/communication';
import { AppUiNotificationModule } from '@apollo/app/ui/notification';
import { AppUsersnapModule } from '@apollo/app/usersnap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DATA_SUBSCRIPTION_SERVICE_API_URL } from '@apollo/app/services/data-subscription';
import { ENV } from '../environments/environment.provider';
import { EffectsModule } from '@ngrx/effects';
import { FILE_UPLOAD_CONFIGURATION } from '@apollo/app/upload-widget';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GisCanvasModule } from '@slb-innersource/gis-canvas';
import { HomeModule } from './home/home.module';
import { METADATA_SERVICE_API_URL } from '@apollo/app/metadata';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '@slb-dls/angular-material/notification';
import { SLB_THEMING_OPTIONS } from '@slb-dls/angular-material/core';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbNavigationFrameworkModule } from '@slb-dls/angular-material/navigation-framework';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { UserAccessEffects } from './access-denied/state/effects/user-subscription-effects';
import { WhatfixModule } from '@apollo/app/whatfix';
import { take } from 'rxjs/operators';
import { themeConfig } from './themes/theme.config';

@NgModule({
  declarations: [AppComponent, ToolbarComponent, AccessDeniedComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppUsersnapModule,
    AppAuthCodeflowModule.forRoot(
      {
        provide: AuthConfig,
        useValue: environment.authConfig
      },
      true
    ),
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
    DelfiUserProfileModule,
    DelfiSupportModule,
    DelfiGuiOidcModule,
    DelfiGuiAuthModule.forRoot(DelfiGuiAuthConfigService),
    FlexLayoutModule,
    AppUiNotificationModule,
    NgxGoogleAnalyticsModule.forRoot(environment.measurementId),
    NgxGoogleAnalyticsRouterModule.forRoot({ include: ['*/vendor/*'], exclude: [] }),
    AppServicesMediaDownloadModule.forRoot(true),
    AppServicesMediaDocumentUploaderModule.forRoot(true),
    AppFeatureFlagModule,
    WhatfixModule,
    HomeModule,
    MatIconModule,
    MatBadgeModule,
    SlbButtonModule,
    SlbNavigationFrameworkModule,
    StoreModule.forFeature(accessFeatureKey, userAccessReducer),
    EffectsModule.forFeature([UserAccessEffects]),
    StoreModule.forFeature(commonDataFeatureKey, commonReducer),
    SecureEnvironmentServiceModule.forRoot({
      provide: SECURE_ENVIRONMENT_SERVICE_API_URL,
      useValue: environment.api.metadata
    }),
    AppServicesCommunicationModule.forRoot({
      webSocketUrl: environment.api.wsCommunicationUrl,
      communicationServiceApiUrl: environment.api.communication,
      protocolName: 'slb-chat'
    }),
    TrafficManagerServiceModule.forRoot({
      provide: TRAFFIC_MANAGER_CONFIGURATION,
      useValue: {
        errorRedirect: environment.trafficManager.errorRedirect,
        trafficManagerUrl: environment.trafficManager.trafficManagerUrl,
        isEnabled: JSON.parse(environment.trafficManager.isEnabled)
      }
    })
  ],
  providers: [
    {
      provide: ENV,
      useValue: env
    },
    MessageService,
    DelfiGuiOidcService,
    {
      provide: DelfiGuiAuthConfig,
      useValue: environment.delfiGuiAuthConfig
    },
    {
      provide: SETTINGS_SERVICE_API_URL,
      useValue: environment.api.metadata
    },
    {
      provide: APP_OPPORTUNITY_BASE_URL,
      useValue: environment.api.appBaseUrl
    },
    {
      provide: APP_BASE_URL,
      useValue: environment.api.appBaseUrl
    },
    {
      provide: METADATA_SERVICE_API_URL,
      useValue: environment.api.metadata
    },
    {
      provide: FILE_UPLOAD_CONFIGURATION,
      useValue: {
        fileManager: {
          common: environment.api.commonFileManager,
          osdu: environment.api.osduFileManager
        }
      }
    },
    {
      provide: TM_CONSUMER_DETAILS,
      useValue: environment.trafficManagerConfig
    },
    {
      provide: DATA_PACKAGES_SERVICE_API_URL,
      useValue: environment.api.dataPackages
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
      provide: GATEWAY_BASE_URL_FOR_OPPORTUNITY,
      useValue: environment.api.appBaseUrl + '/api/gateway/host'
    },
    {
      provide: APP_CCM_SERVICE_HOST,
      useValue: environment.api.appCCMServiceHost
    },
    {
      provide: AT_APP_Code,
      useValue: environment.assetTransactionAppCode
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (vendorAppService: VendorAppService, authService: AuthCodeFlowService) => {
        return async (): Promise<any> => {
          const isSignedIn = await authService.isSignedIn().pipe(take(1)).toPromise();
          if (isSignedIn) {
            const vendorData = await vendorAppService.retrieveDataVendors(true).toPromise();
            return vendorAppService.retrieveAssociatedConsumerAppUrl(vendorData[0]?.dataVendorId);
          }
        };
      },
      deps: [VendorAppService, AuthCodeFlowService],
      multi: true
    },
    {
      provide: DELFI_USER_CONTEXT,
      useFactory: (config: VendorAppService) => {
        return config.userContext;
      },
      deps: [VendorAppService]
    },
    {
      provide: DATA_VENDORS_DETAILS,
      useFactory: (config: VendorAppService) => {
        return config.dataVendors;
      },
      deps: [VendorAppService]
    },
    {
      provide: COMMON_FILE_MANAGER_URL,
      useValue: environment.api.commonFileManager
    },
    {
      provide: SHAPE_FILE_VALIDATOR_WORKER_FACTORY,
      useValue: new Worker(new URL('./workers/shape-file-validator.worker', import.meta.url), { type: 'module' })
    },
    {
      provide: GEOJSON_FILE_VALIDATOR_WORKER_FACTORY,
      useValue: new Worker(new URL('./workers/geojson-file-validator.worker', import.meta.url), { type: 'module' })
    },
    {
      provide: MEDIA_FILE_DOWNLOAD_API_URL,
      useValue: environment.api.commonFileManager
    },
    {
      provide: MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL,
      useValue: environment.api.multipleFileDownload
    },
    {
      provide: OPPORTUNITY_SERVICE_API_URL,
      useValue: environment.api.opportunity
    },
    {
      provide: OPPORTUNITY_SUBSCRIPTION_API_URL,
      useValue: environment.api.opportunitySubscriptions
    },
    {
      provide: OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL,
      useValue: environment.api.opportunitySubscriptionRequest
    },
    {
      provide: OPPORTUNITY_MAP_REP_SERVICE_API_URL,
      useValue: environment.api.opportunityMapRepresentation
    },
    {
      provide: OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
      useValue: environment.api.opportunityAttendee
    },

    { provide: SLB_THEMING_OPTIONS, useValue: themeConfig },
    {
      provide: DELFI_PORTAL_APP,
      useValue: environment.delfiPortalApp
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
