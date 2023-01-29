import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { DocumentsWidgetComponent } from './documents-widget/documents-widget.component';
import { DISCOVERY_API_URL, DocumentsService } from './services/documents.service';
import { DocumentsEffects } from './state/effects/documents.effects';
import { documentsFeatureKey, documentsReducer } from './state/reducers/documents.reducer';

interface AppUiDocumentsModuleOptions {
  discoveryApiUrl: string;
}

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StoreModule.forFeature(documentsFeatureKey, documentsReducer),
    EffectsModule.forFeature([DocumentsEffects])
  ],
  declarations: [DocumentsWidgetComponent],
  exports: [DocumentsWidgetComponent]
})
export class AppUiDocumentsModule {
  /* istanbul ignore next */
  static forRoot(options: AppUiDocumentsModuleOptions): ModuleWithProviders<AppUiDocumentsModule> {
    return {
      ngModule: AppUiDocumentsModule,
      providers: [
        {
          provide: DISCOVERY_API_URL,
          useValue: options.discoveryApiUrl
        },
        DocumentsService
      ]
    };
  }
}
