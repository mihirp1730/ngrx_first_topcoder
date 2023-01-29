import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IS_BILLING_ACCOUNT_ID_REQUIRED, MediaDocumentUploaderService } from './media-document-uploader.service';
@NgModule({
  imports: [ CommonModule ],
})
export class AppServicesMediaDocumentUploaderModule { 
  static forRoot(IsBillingAccountIdRequired: boolean): ModuleWithProviders<AppServicesMediaDocumentUploaderModule> {
    return {
      ngModule: AppServicesMediaDocumentUploaderModule,
      providers: [{ provide: IS_BILLING_ACCOUNT_ID_REQUIRED, useValue: IsBillingAccountIdRequired }, MediaDocumentUploaderService]
    };
  }
}
