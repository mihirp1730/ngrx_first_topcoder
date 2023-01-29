import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ScrollViewComponent } from './scroll-view/scroll-view.component';

@NgModule({
  imports: [CommonModule, ScrollingModule, MatProgressSpinnerModule],
  declarations: [ScrollViewComponent],
  exports: [ScrollViewComponent]
})
export class AppDashboardModule {}
