import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { MatIconModule } from '@angular/material/icon';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionDashboardComponent } from './subscription-dashboard/subscription-dashboard.component';
import { SubscriptionContainerComponent } from './subscription-container/subscription-container.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubscriptionTableModule } from './subscription-table/subscription-table.module';
import { SubscriptionFilterModule } from './subscription-filter/subscription-filter.module';

@NgModule({
  declarations: [SubscriptionContainerComponent, SubscriptionDashboardComponent],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    SlbButtonModule,
    MatIconModule,
    ScrollingModule,
    MatProgressSpinnerModule,
    SubscriptionTableModule,
    SubscriptionFilterModule
  ]
})
export class SubscriptionModule {}
