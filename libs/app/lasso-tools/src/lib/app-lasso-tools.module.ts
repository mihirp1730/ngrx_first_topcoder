import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LassoToolsComponent } from './lasso-tools/lasso-tools.component';

@NgModule({
  imports: [CommonModule, SlbButtonModule, MatIconModule, MatTooltipModule],
  declarations: [LassoToolsComponent],
  exports: [LassoToolsComponent]
})
export class AppLassoToolsModule {}
