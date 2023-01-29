import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule]
})
export class AppServicesDataVendorModule {
  static forRoot(): ModuleWithProviders<AppServicesDataVendorModule> {
    return {
      ngModule: AppServicesDataVendorModule,
      providers: []
    }
  }
}
