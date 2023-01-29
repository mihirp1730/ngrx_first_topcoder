import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AppUiAsyncIconModule } from '@apollo/app/ui/async-icon';
import { debounce } from 'lodash';

import { IButtonDisplayConfig } from './interfaces';
import { SummaryCardButtonsComponent, BUTTON_DISPLAY_CONFIG } from './components/summary-card-buttons/summary-card-buttons.component';
import { DISCOVERY_API_URL, SUMMARY_CARD_DEBOUNCE_FACTORY, SummaryCardService } from './services/summary-card.service';

interface AppUiSummaryCardButtonsModuleOptions {
  discoveryApiUrl: string;
  buttonDisplayConfig: IButtonDisplayConfig;
}

@NgModule({
  imports: [
    CommonModule,
    AppUiAsyncIconModule
  ],
  declarations: [
    SummaryCardButtonsComponent
  ],
  exports: [
    SummaryCardButtonsComponent
  ]
})
export class AppUiSummaryCardButtonsModule {
  /* istanbul ignore next */
  static forRoot(options: AppUiSummaryCardButtonsModuleOptions): ModuleWithProviders<AppUiSummaryCardButtonsModule> {
    return {
      ngModule: AppUiSummaryCardButtonsModule,
      providers: [
        {
          provide: DISCOVERY_API_URL,
          useValue: options.discoveryApiUrl
        },
        {
          provide: SUMMARY_CARD_DEBOUNCE_FACTORY,
          useValue: (cb: () => void) => debounce(() => cb(), 500)
        },
        {
          provide: BUTTON_DISPLAY_CONFIG,
          useValue: options.buttonDisplayConfig
        },
        SummaryCardService
      ]
    }
  }
}
