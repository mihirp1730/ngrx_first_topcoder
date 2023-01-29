import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AsyncIconComponent } from './components/async-icon/async-icon.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  declarations: [AsyncIconComponent],
  exports: [AsyncIconComponent]
})
export class AppUiAsyncIconModule {}
