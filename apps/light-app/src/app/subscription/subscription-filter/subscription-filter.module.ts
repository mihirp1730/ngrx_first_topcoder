import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbSearchModule } from '@slb-dls/angular-material/search';

import { SubscriptionFilterComponent } from './subscription-filter.component';

@NgModule({
  declarations: [SubscriptionFilterComponent],
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, SlbFormFieldModule, SlbSearchModule],
  exports: [SubscriptionFilterComponent]
})
export class SubscriptionFilterModule {}
