import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionTableComponent } from './subscription-table.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

import { SubscriptionTableActionsComponent } from './subscription-table-actions/subscription-table-actions.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [CommonModule, MatExpansionModule, MatProgressSpinnerModule, RouterModule],
  declarations: [SubscriptionTableComponent, SubscriptionTableActionsComponent],
  exports: [SubscriptionTableComponent]
})
export class SubscriptionTableModule {}
