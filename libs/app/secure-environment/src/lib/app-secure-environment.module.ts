import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

import { SecureEnvironmentService, SECURE_ENVIRONMENT_SERVICE_API_URL } from './secure-environment.service';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';

@NgModule({
  imports: [CommonModule]
})
export class SecureEnvironmentServiceModule {
  static forRoot(secureEnvironmentProvider: Provider): ModuleWithProviders<SecureEnvironmentServiceModule> {
    return {
      ngModule: SecureEnvironmentServiceModule,
      providers: [
        secureEnvironmentProvider,
        {
          provide: SecureEnvironmentService,
          useFactory: (endpoint: string) => {
            const xhr = () => new XMLHttpRequest();
            return new SecureEnvironmentService(xhr, endpoint);
          },
          deps: [SECURE_ENVIRONMENT_SERVICE_API_URL]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: (authCodeFlowService: AuthCodeFlowService, secureEnvironmentService: SecureEnvironmentService) => {
            return async (): Promise<any> => {
              const isSignedIn = await authCodeFlowService.isSignedIn().pipe(take(1)).toPromise();
              if (isSignedIn) {
                const getUser = await authCodeFlowService.getUser().pipe(take(1)).toPromise();
                return secureEnvironmentService.load(getUser.accessToken);
              }
            };
          },
          deps: [AuthCodeFlowService, SecureEnvironmentService],
          multi: true
        }
      ]
    };
  }
}
