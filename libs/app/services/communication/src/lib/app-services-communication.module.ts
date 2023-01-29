import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';

import { COMMUNICATION_SERVICE_API_URL, CommunicationService, WEBSOCKET_FACTORY } from './communication.service';
import { IAppServicesCommunicationModuleOptions } from './interfaces/communication.interface';

@NgModule({
  imports: [CommonModule]
})
export class AppServicesCommunicationModule {
  /* istanbul ignore next */
  static forRoot(options: IAppServicesCommunicationModuleOptions): ModuleWithProviders<AppServicesCommunicationModule> {
    return {
      ngModule: AppServicesCommunicationModule,
      providers: [
        {
          provide: WEBSOCKET_FACTORY,
          useValue: (token: string, requestUrl: string) => {
            const protocol = [options.protocolName, `${token}`];
            if (requestUrl) {
              protocol.push(requestUrl);
            }
            return webSocket({ url: options.webSocketUrl, protocol });
          }
        },
        {
          provide: COMMUNICATION_SERVICE_API_URL,
          useValue: options.communicationServiceApiUrl
        },
        CommunicationService
      ]
    };
  }
}
