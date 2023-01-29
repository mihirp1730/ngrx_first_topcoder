import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GisSearchBoxModule } from '@slb-innersource/gis-canvas';

import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
  imports: [CommonModule, SlbButtonModule, MatIconModule, MatTooltipModule, GisSearchBoxModule],
  declarations: [SearchBarComponent],
  exports: [SearchBarComponent]
})
export class AppMainSearchModule {}
