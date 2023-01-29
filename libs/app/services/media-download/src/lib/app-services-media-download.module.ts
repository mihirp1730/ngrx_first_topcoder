import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { IS_BILLING_ACCOUNT_ID_REQUIRED, MediaDownloadService } from './media-download.service';

@NgModule({
  imports: [CommonModule],
  providers: [MediaDownloadService]
})
export class AppServicesMediaDownloadModule {
  static forRoot(IsBilingAccountIdRequired: boolean): ModuleWithProviders<AppServicesMediaDownloadModule> {
    return {
      ngModule: AppServicesMediaDownloadModule,
      providers: [{ provide: IS_BILLING_ACCOUNT_ID_REQUIRED, useValue: IsBilingAccountIdRequired }, MediaDownloadService]
    };
  }
}
