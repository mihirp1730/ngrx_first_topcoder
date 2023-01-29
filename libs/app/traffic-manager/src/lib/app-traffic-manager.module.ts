import { APP_INITIALIZER, NgModule, ModuleWithProviders, Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import * as jwtDecode from 'jwt-decode';

import { ITrafficManagerConfiguration, TRAFFIC_MANAGER_CONFIGURATION, TRAFFIC_MANAGER_SERVICE } from './interfaces';
import { TrafficManagerInterceptor } from './interceptors/traffic-manager-interceptor.service';
import {
  HistoryRefToken,
  JwtDecoderToken,
  LocalStorageToken,
  LocationRefToken,
  SetTimeoutFactoryToken,
  TrafficManagerService
} from './traffic-manager.service';

@NgModule({})
export class TrafficManagerServiceModule {
  static forRoot(
    configProvider: Provider
  ): ModuleWithProviders<TrafficManagerServiceModule> {
    return {
      ngModule: TrafficManagerServiceModule,
      providers: [
        configProvider,
        {
          provide: HistoryRefToken,
          useValue: window.history
        },
        {
          provide: JwtDecoderToken,
          useValue: jwtDecode
        },
        {
          provide: LocalStorageToken,
          useValue: localStorage
        },
        {
          provide: LocationRefToken,
          useValue: location
        },
        {
          provide: SetTimeoutFactoryToken,
          useValue: () => setTimeout
        },
        {
          provide: TRAFFIC_MANAGER_SERVICE,
          useClass: TrafficManagerService
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TrafficManagerInterceptor,
          multi: true
        },
        {
          provide: APP_INITIALIZER,
          deps: [TRAFFIC_MANAGER_SERVICE, TRAFFIC_MANAGER_CONFIGURATION],
          useFactory: TrafficManagerServiceModule.TrafficManagerInitializeFactory,
          multi: true
        }
      ]
    };
  }
  static TrafficManagerInitializeFactory(
    trafficManagerService: TrafficManagerService,
    configuration: ITrafficManagerConfiguration
  ): () => Promise<void> {
    return () => trafficManagerService.initialize(configuration);
  }
}
