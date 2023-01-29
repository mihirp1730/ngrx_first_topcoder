import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlbDateTimePickerModule } from '@slb-dls/angular-material/date-time-picker';
import { SlbCurrencyInputModule } from '@slb-dls/angular-material/currency-input';
import { SlbModalModule } from '@slb-dls/angular-material/modal';
import { AppUploadWidgetModule } from '@apollo/app/upload-widget';
import { AppUiDataGridModule } from '@apollo/app/ui/data-grid';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionContainerComponent } from './subscription-container/subscription-container.component';
import { CreateSubscriptionComponent } from './create-subscription/create-subscription.component';
import { ManageSubscriptionComponent } from './manage-subscription/manage-subscription.component';

@NgModule({
  declarations: [
    SubscriptionContainerComponent,
    CreateSubscriptionComponent,
    ManageSubscriptionComponent
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SlbButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    ScrollingModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    SlbDateTimePickerModule,
    AppUploadWidgetModule,
    SlbCurrencyInputModule,
    SlbModalModule,
    AppUiDataGridModule
  ]
})
export class SubscriptionModule {}

